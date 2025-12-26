import { err, ok, ResultAsync } from 'neverthrow';

import {
  AbstractAggregateRoot,
  AbstractMapper,
  RepositoryPort,
  EntityNotFoundError,
  EntityConflictError,
  DomainResultAsync,
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
  TDelegate extends AbstractCrudDelegate<TDbModel>,
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

  findOneById(id: string): DomainResultAsync<TAggregate | null, never> {
    return this.findOneEntity({
      where: { id },
    });
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

  protected findOneEntity(
    args: Parameters<TDelegate['findUnique']>[0],
  ): DomainResultAsync<TAggregate | null, never> {
    return ResultAsync.fromPromise(
      this.delegate.findUnique({
        ...args,
      }),
      (e) => {
        throw new UnexpectedPrismaErrorException(this.constructor.name, 'findOneEntity', e);
      },
    ).map((record) => (record ? this.mapper.toDomain(record) : null));
  }

  protected getOneEntity(
    args: Parameters<TDelegate['findUnique']>[0],
  ): DomainResultAsync<TAggregate, EntityNotFoundError> {
    return this.findOneEntity(args).andThen((entity) =>
      entity
        ? ok(entity)
        : err(
            new EntityNotFoundError({
              entityName: this.entityName,
              entityId: JSON.stringify(args.where),
            }),
          ),
    );
  }

  protected findManyEntities(
    args: Parameters<TDelegate['findMany']>[0],
  ): DomainResultAsync<TAggregate[], never> {
    return ResultAsync.fromPromise(
      this.delegate.findMany({
        ...args,
      }),
      (e) => {
        throw new UnexpectedPrismaErrorException(this.constructor.name, 'findManyEntities', e);
      },
    ).map((records) => (records as TDbModel[]).map((record) => this.mapper.toDomain(record)));
  }

  protected count(args: Parameters<TDelegate['count']>[0]): DomainResultAsync<number, never> {
    return ResultAsync.fromPromise(
      this.delegate.count({
        ...args,
      }),
      (e) => {
        throw new UnexpectedPrismaErrorException(this.constructor.name, 'count', e);
      },
    );
  }

  protected existsEntity(
    args: Parameters<TDelegate['count']>[0],
  ): DomainResultAsync<boolean, never> {
    return this.count(args).map((count) => count > 0);
  }

  protected createEntity(entity: TAggregate): DomainResultAsync<TAggregate, EntityConflictError> {
    const record = this.mapper.toPersistence(entity);
    return ResultAsync.fromPromise(this.delegate.create({ data: record }), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(record, error);
        if (conflictResult) return conflictResult;
      }
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createEntity', error);
    })
      .map((entity) => this.mapper.toDomain(entity))
      .andTee((entity) => this.publishEvents(entity));
  }

  protected updateEntity(
    entity: TAggregate,
  ): DomainResultAsync<TAggregate, EntityNotFoundError | EntityConflictError> {
    const record = this.mapper.toPersistence(entity);
    return ResultAsync.fromPromise(
      this.delegate.update({
        where: { id: entity.id },
        data: record,
      }),
      (error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const notFoundResult = this.handleP2025(entity.id, error);
          if (notFoundResult) return notFoundResult;

          const conflictResult = this.handleP2002(record, error);
          if (conflictResult) return conflictResult;
        }

        throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateEntity', error);
      },
    )
      .map((result) => this.mapper.toDomain(result))
      .andTee((entity) => this.publishEvents(entity));
  }

  protected updateOneDirectly(
    args: Parameters<TDelegate['update']>[0],
  ): DomainResultAsync<TAggregate, EntityNotFoundError | EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.update(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025((args.where as { id: ModelId }).id, error);
        if (notFoundResult) return notFoundResult;

        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateOneDirectly', error);
    }).map((result) => this.mapper.toDomain(result));
  }

  protected updateManyDirectly(
    args: Parameters<TDelegate['updateMany']>[0],
  ): DomainResultAsync<number, EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.updateMany(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateManyDirectly', error);
    }).map((result) => result.count);
  }

  protected deleteEntity(
    entity: DeletedAggregate<TAggregate>,
  ): DomainResultAsync<void, EntityNotFoundError> {
    return ResultAsync.fromPromise(
      this.delegate.delete({
        where: { id: entity.id },
      }),
      (error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const notFoundResult = this.handleP2025(entity.id, error);
          if (notFoundResult) return notFoundResult;
        }

        throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteEntity', error);
      },
    )
      .map(() => undefined)
      .andTee(() => this.publishEvents(entity));
  }

  protected publishEvents(entity: TAggregate): DomainResultAsync<void, never> {
    const events = entity.pullEvents();
    return ResultAsync.fromSafePromise(this.eventDispatcher.publishMany(events));
  }

  protected handleP2002(
    data: Record<string, unknown> | undefined,
    error: Prisma.PrismaClientKnownRequestError,
  ): EntityConflictError | undefined {
    if (error.code === 'P2002') {
      const targets = (error.meta?.target as string[]) || [];
      const details = targets.map((field) => ({
        field,
        value: data ? data[field] : undefined,
      }));

      return new EntityConflictError({
        entityName: this.entityName,
        conflicts: details,
      });
    }
  }

  protected handleP2025(
    id: ModelId | undefined,
    error: Prisma.PrismaClientKnownRequestError,
  ): EntityNotFoundError | undefined {
    if (error.code === 'P2025') {
      return new EntityNotFoundError({
        entityName: this.entityName,
        entityId: id || undefined,
      });
    }
  }
}
