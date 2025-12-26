import { err, ok } from 'neverthrow';

import {
  AbstractAggregateRoot,
  AbstractMapper,
  RepositoryPort,
  EntityNotFoundError,
  EntityConflictError,
  DomainResult,
  DeletedAggregate,
} from '@workspace/backend-ddd';
import {
  createPaginatedResult,
  getPaginationSkip,
  PaginatedResult,
  PaginationOptions,
} from '@workspace/common';
import { PrismaClient, Prisma } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { UnexpectedPrismaErrorException } from '../core.exceptions';
import { BaseDomainEvent, BaseDomainEventProps, DomainEventPublisherPort } from '../messages';
import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

export abstract class BaseRepository<
  TAggregate extends AbstractAggregateRoot<
    unknown,
    ModelId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseDomainEvent<BaseDomainEventProps<any>>
  >,
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel> = AbstractCrudDelegate<TDbModel>,
> implements RepositoryPort<TAggregate> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: AbstractMapper<TAggregate, TDbModel>,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {}

  protected get entityName(): string {
    return this.constructor.name.replace('Repository', '');
  }

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

  protected abstract get delegate(): TDelegate;

  async findOneById(id: string): Promise<TAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  // --------------------------------------------------------------------------
  // Protected Helpers: 구체적인 Repository의 public 메서드(save 등)에서 호출하여 사용
  // --------------------------------------------------------------------------

  protected async findManyPaginatedEntities(
    options: PaginationOptions,
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
  ): Promise<PaginatedResult<TAggregate>> {
    const { skip, take } = getPaginationSkip(options);

    const [records, totalItems] = await Promise.all([
      this.delegate.findMany({
        ...args,
        skip,
        take,
      }),
      this.delegate.count({
        where: args.where,
      }),
    ]);

    const entities = (records as TDbModel[]).map((record) => this.mapper.toDomain(record));

    return createPaginatedResult({
      items: entities,
      totalItems,
      options,
    });
  }

  protected async findOneEntity(
    args: Omit<Parameters<TDelegate['findUnique']>[0], 'where'> & {
      where: Record<string, unknown>;
    },
  ): Promise<TAggregate | null> {
    const record = await this.delegate.findUnique({
      ...args,
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  protected async getOneEntity(
    args: Omit<Parameters<TDelegate['findUnique']>[0], 'where'> & {
      where: Record<string, unknown>;
    },
  ): Promise<DomainResult<TAggregate, EntityNotFoundError>> {
    const record = await this.delegate.findUnique({
      ...args,
    });
    if (!record) {
      return err(
        new EntityNotFoundError({
          entityName: this.constructor.name.replace('Repository', ''),
          entityId: JSON.stringify(args.where),
        }),
      );
    }
    return ok(this.mapper.toDomain(record));
  }

  protected async findAllEntities(
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
  ): Promise<TAggregate[]> {
    const records = await this.delegate.findMany({
      ...args,
    });
    return (records as TDbModel[]).map((record) => this.mapper.toDomain(record));
  }

  protected async count(
    args: Omit<Parameters<TDelegate['count']>[0], 'skip' | 'take'>,
  ): Promise<number> {
    return this.delegate.count({
      ...args,
    });
  }

  protected async existsEntity(
    args: Omit<Parameters<TDelegate['count']>[0], 'skip' | 'take'>,
  ): Promise<boolean> {
    const count = await this.delegate.count({
      ...args,
    });
    return count > 0;
  }

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
        const conflictResult = this.handleP2002(record, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createEntity', error);
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
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createManyEntities', error);
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
        const notFoundResult = this.handleP2025(entity.id, error);
        if (notFoundResult) return notFoundResult;

        const conflictResult = this.handleP2002(record, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateEntity', error);
    }
  }

  protected async updateManyDirectly(
    where: Parameters<TDelegate['updateMany']>[0]['where'],
    data: Parameters<TDelegate['updateMany']>[0]['data'],
  ) {
    try {
      const { count } = await this.delegate.updateMany({
        where,
        data,
      });
      return ok(count);
    } catch (error) {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateManyDirectly', error);
    }
  }

  protected async deleteEntity(
    entity: DeletedAggregate<TAggregate>,
  ): Promise<DomainResult<void, EntityNotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id: entity.id },
      });

      await this.publishEvents(entity as TAggregate);
      return ok(undefined);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025((entity as TAggregate).id, error);
        if (notFoundResult) return notFoundResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteEntity', error);
    }
  }

  protected async publishEvents(entity: TAggregate): Promise<void> {
    const events = entity.pullEvents();
    if (events.length > 0) {
      await this.eventDispatcher.publishMany(events);
    }
  }

  protected handleP2025(id: ModelId, error: Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return err(
        new EntityNotFoundError({
          entityName: this.entityName,
          entityId: id,
        }),
      );
    }
  }

  protected handleP2002(
    data: Record<string, unknown>,
    error: Prisma.PrismaClientKnownRequestError,
  ) {
    if (error.code === 'P2002') {
      const targets = (error.meta?.target as string[]) || [];
      const details = targets.map((field) => ({
        field,
        value: data[field],
      }));

      return err(
        new EntityConflictError({
          entityName: this.entityName,
          conflicts: details,
        }),
      );
    }
  }
}
