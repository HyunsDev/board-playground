import { err, ok, ResultAsync } from 'neverthrow';

import {
  AbstractMapper,
  RepositoryPort,
  EntityNotFoundError,
  EntityConflictError,
  DomainResultAsync,
  AbstractEntity,
} from '@workspace/backend-ddd';
import {
  createPaginatedResult,
  getPaginationSkip,
  PaginatedResult,
  PaginationOptions,
} from '@workspace/common';
import { PrismaClient, Prisma } from '@workspace/database';
import { Id } from '@workspace/domain';

import { UnexpectedPrismaErrorException } from '../core.exceptions';
import { BasePrismaRepository } from './base.prisma-repository';
import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

export abstract class BaseEntityRepository<
  TEntity extends AbstractEntity<unknown, Id>,
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel>,
>
  extends BasePrismaRepository<TDelegate>
  implements RepositoryPort<TEntity>
{
  constructor(
    prisma: PrismaClient,
    txContext: TransactionContext,
    protected readonly mapper: AbstractMapper<TEntity, TDbModel>,
  ) {
    super(prisma, txContext);
  }

  findOneById(id: string): DomainResultAsync<TEntity | null, never> {
    return this.findUniqueEntity({
      where: { id },
    });
  }

  // --------------------------------------------------------------------------
  // Protected Helpers: 구체적인 Repository의 public 메서드(save 등)에서 호출하여 사용
  // --------------------------------------------------------------------------

  protected findManyPaginatedEntities(
    options: PaginationOptions,
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
  ): DomainResultAsync<PaginatedResult<TEntity>, never> {
    const { skip, take } = getPaginationSkip(options);

    return ResultAsync.fromPromise(
      Promise.all([
        this.delegate.findMany({
          ...args,
          skip,
          take,
        }),
        this.delegate.count({
          where: args.where,
        }),
      ]),
      (e) => {
        throw new UnexpectedPrismaErrorException(
          this.constructor.name,
          'findManyPaginatedEntities',
          e,
        );
      },
    ).map(([records, totalItems]) => {
      const entities = (records as TDbModel[]).map((record) => this.mapper.toDomain(record));

      return createPaginatedResult({
        items: entities,
        totalItems,
        options,
      });
    });
  }

  protected findUniqueEntity(
    args: Parameters<TDelegate['findUnique']>[0],
  ): DomainResultAsync<TEntity | null, never> {
    return ResultAsync.fromPromise(this.delegate.findUnique(args), (e) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'findUniqueEntity', e);
    }).map((record) => (record ? this.mapper.toDomain(record) : null));
  }

  protected getUniqueEntity(
    args: Parameters<TDelegate['findUnique']>[0],
  ): DomainResultAsync<TEntity, EntityNotFoundError> {
    return this.findUniqueEntity(args).andThen((entity) =>
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

  protected findFirstEntity(
    args: Parameters<TDelegate['findFirst']>[0],
  ): DomainResultAsync<TEntity | null, never> {
    return ResultAsync.fromPromise(this.delegate.findFirst(args), (e) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'findFirstEntity', e);
    }).map((record) => (record ? this.mapper.toDomain(record) : null));
  }

  protected getFirstEntity(
    args: Parameters<TDelegate['findFirst']>[0],
  ): DomainResultAsync<TEntity, EntityNotFoundError> {
    return this.findFirstEntity(args).andThen((entity) =>
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
  ): DomainResultAsync<TEntity[], never> {
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

  protected createEntity(entity: TEntity): DomainResultAsync<TEntity, EntityConflictError> {
    const record = this.mapper.toPersistence(entity);
    return ResultAsync.fromPromise(this.delegate.create({ data: record }), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(record, error);
        if (conflictResult) return conflictResult;
      }
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createEntity', error);
    }).map((entity) => this.mapper.toDomain(entity));
  }

  protected updateEntity(
    entity: TEntity,
  ): DomainResultAsync<TEntity, EntityNotFoundError | EntityConflictError> {
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
    ).map((result) => this.mapper.toDomain(result));
  }

  protected updateOneDirectly(
    args: Parameters<TDelegate['update']>[0],
  ): DomainResultAsync<TEntity, EntityNotFoundError | EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.update(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025((args.where as { id: Id }).id, error);
        if (notFoundResult) return notFoundResult;

        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateOneDirectly', error);
    }).map((result) => this.mapper.toDomain(result));
  }

  protected updateManyEntitiesDirectly(
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

  protected deleteEntity(entity: TEntity): DomainResultAsync<void, EntityNotFoundError> {
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
    ).map(() => undefined);
  }

  protected deleteManyEntitiesDirectly(
    args: Parameters<TDelegate['deleteMany']>[0],
  ): DomainResultAsync<void, never> {
    return ResultAsync.fromPromise(this.delegate.deleteMany(args), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteManyDirectly', error);
    }).map(() => undefined);
  }
}
