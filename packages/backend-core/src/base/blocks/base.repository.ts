import { Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  AbstractAggregateRoot,
  AbstractMapper,
  RepositoryPort,
  EntityNotFoundError,
  EntityConflictError,
  DomainResult,
} from '@workspace/backend-ddd';
import { PrismaClient, Prisma } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { UnexpectedPrismaErrorException } from '../core.exceptions';
import { BaseDomainEvent, BaseDomainEventProps, DomainEventPublisherPort } from '../messages';

import { TransactionContext } from '@/modules';

type AbstractCrudDelegate<R> = {
  findUnique(args: unknown): Promise<R | null>;
  create(args: unknown): Promise<R>;
  createMany(args: unknown): Promise<{
    count: number;
  }>;
  update(args: unknown): Promise<R>;
  delete(args: unknown): Promise<R>;
};

export abstract class BaseRepository<
  TAggregate extends AbstractAggregateRoot<
    unknown,
    ModelId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseDomainEvent<BaseDomainEventProps<any>>
  >,
  TDbModel extends { id: string },
> implements RepositoryPort<TAggregate> {
  protected abstract get delegate(): AbstractCrudDelegate<TDbModel>;

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: AbstractMapper<TAggregate, TDbModel>,
    protected readonly eventDispatcher: DomainEventPublisherPort,
    protected readonly logger: Logger,
  ) {}

  /**
   * 현재 트랜잭션 컨텍스트가 있으면 트랜잭션 클라이언트를, 없으면 기본 클라이언트를 반환합니다.
   * (nestjs-cls가 자동으로 처리하지만, 명시적인 제어를 위해 유지)
   */
  protected get client(): PrismaClient | Prisma.TransactionClient {
    if (this.txContext.txHost.isTransactionActive()) {
      return this.txContext.txHost.tx as unknown as Prisma.TransactionClient;
    }
    return this.prisma;
  }

  async findOneById(id: string): Promise<TAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  // --------------------------------------------------------------------------
  // Protected Helpers: 구체적인 Repository의 public 메서드(save 등)에서 호출하여 사용
  // --------------------------------------------------------------------------

  protected async createEntity(
    entity: TAggregate,
  ): Promise<DomainResult<TAggregate, EntityConflictError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const result = await this.delegate.create({
        data: record,
      });

      await this.publishEvents(entity);
      return ok(this.mapper.toDomain(result));
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (record as Record<string, unknown>)[field],
          }));

          return err(
            new EntityConflictError({
              entityName: entity.constructor.name,
              conflicts: details,
            }),
          );
        }
      }

      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async createManyEntities(
    entities: TAggregate[],
  ): Promise<DomainResult<void, EntityConflictError>> {
    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    try {
      await this.delegate.createMany({
        data: records,
        skipDuplicates: false,
      });

      await Promise.all(entities.map((entity) => this.publishEvents(entity)));

      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation (P2002)
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];

          // Bulk Insert 실패 시, 구체적으로 어떤 레코드가 실패했는지 Prisma가 알려주지 않음
          // 따라서 충돌 필드 정보만이라도 반환하도록 구성
          const details = targets.map((field) => ({
            field,
            value: 'Batch insert conflict',
          }));

          return err(
            new EntityConflictError({
              entityName: entities[0]?.constructor.name || 'UnknownAggregate',
              conflicts: details,
            }),
          );
        }
      }
      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async updateEntity(
    entity: TAggregate,
  ): Promise<DomainResult<TAggregate, EntityNotFoundError | EntityConflictError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const result = await this.delegate.update({
        where: { id: entity.id },
        data: record,
      });

      await this.publishEvents(entity);
      return ok(this.mapper.toDomain(result));
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (record as Record<string, unknown>)[field],
          }));
          return err(
            new EntityConflictError({
              entityName: entity.constructor.name,
              conflicts: details,
            }),
          );
        }
        // Record Not Found (update 대상 없음)
        if (error.code === 'P2025') {
          return err(
            new EntityNotFoundError({
              entityName: entity.constructor.name,
              entityId: entity.id,
            }),
          );
        }
      }
      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async deleteEntity(
    entity: TAggregate,
  ): Promise<DomainResult<void, EntityNotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id: entity.id },
      });

      await this.publishEvents(entity);
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(
          new EntityNotFoundError({
            entityName: entity.constructor.name,
            entityId: entity.id,
          }),
        );
      }
      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async publishEvents(entity: TAggregate): Promise<void> {
    const events = entity.pullEvents();
    if (events.length > 0) {
      await this.eventDispatcher.publishMany(events);
    }
  }
}
