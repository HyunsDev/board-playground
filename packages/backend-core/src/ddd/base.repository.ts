import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import {
  AbstractAggregateRoot,
  AbstractMapper,
  RepositoryPort,
  EntityNotFoundError,
  EntityConflictError,
  DomainResult,
  DomainEventPublisher,
  LoggerPort,
  AbstractDomainEvent,
  AbstractIDomainEvent,
} from '@workspace/backend-ddd';
import { PrismaClient, Prisma } from '@workspace/database';

type AbstractCrudDelegate<R> = {
  findUnique(args: any): Promise<R | null>;
  create(args: any): Promise<R>;
  update(args: any): Promise<R>;
  delete(args: any): Promise<R>;
};

export abstract class BaseRepository<
  TAggregate extends AbstractAggregateRoot<
    AbstractDomainEvent<string, string, string, AbstractIDomainEvent<string, unknown>>,
    unknown
  >,
  TDbModel extends { id: string },
> implements RepositoryPort<TAggregate>
{
  protected abstract get delegate(): AbstractCrudDelegate<TDbModel>;

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly mapper: AbstractMapper<TAggregate, TDbModel>,
    protected readonly eventDispatcher: DomainEventPublisher,
    protected readonly logger: LoggerPort,
  ) {}

  /**
   * 현재 트랜잭션 컨텍스트가 있으면 트랜잭션 클라이언트를, 없으면 기본 클라이언트를 반환합니다.
   * (nestjs-cls가 자동으로 처리하지만, 명시적인 제어를 위해 유지)
   */
  protected get client(): PrismaClient | Prisma.TransactionClient {
    if (this.txHost.isTransactionActive()) {
      return this.txHost.tx as unknown as Prisma.TransactionClient;
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
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (record as any)[field],
          }));

          return err(
            new EntityConflictError({
              entityName: entity.constructor.name,
              conflicts: details,
            }),
          );
        }
      }
      this.logger.error(`[CreateEntity] Unexpected Error: ${error.message}`, error);
      throw error;
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
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (record as any)[field],
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
      this.logger.error(`[UpdateEntity] Unexpected Error: ${error.message}`, error);
      throw error;
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
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(
          new EntityNotFoundError({
            entityName: entity.constructor.name,
            entityId: entity.id,
          }),
        );
      }
      this.logger.error(`[DeleteEntity] Unexpected Error: ${error.message}`, error);
      throw error;
    }
  }

  protected async publishEvents(entity: TAggregate): Promise<void> {
    const events = entity.pullEvents();
    if (events.length > 0) {
      await this.eventDispatcher.publishMany(events);
    }
  }
}
