import { err, ok, ResultAsync } from 'neverthrow';

import {
  EntityNotFoundError,
  EntityConflictError,
  DirectRepositoryPort,
  DomainResultAsync,
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
import { BasePrismaRepository } from './base.prisma-repository';
import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

/**
 * Entity, Mapper, EventPublisher를 거치지 않고
 * DB 레코드에 직접 접근하는 Repository의 기본 구현체
 */
export abstract class BaseDirectRepository<
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel>,
> extends BasePrismaRepository<TDelegate> implements DirectRepositoryPort<TDbModel> {
  constructor(prisma: PrismaClient, txContext: TransactionContext) {
    super(prisma, txContext);
  }

  findOneById(id: string): DomainResultAsync<TDbModel | null, never> {
    return this.findUniqueRecord({
      where: { id },
    });
  }

  protected findUniqueRecord(
    args: Parameters<TDelegate['findUnique']>[0],
  ): DomainResultAsync<TDbModel | null, never> {
    return ResultAsync.fromPromise(this.delegate.findUnique({ ...args }), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'findUniqueRecord', error);
    });
  }

  protected getUniqueRecord(
    args: Parameters<TDelegate['findUnique']>[0] & {
      where: Record<string, unknown>;
    },
  ): DomainResultAsync<TDbModel, EntityNotFoundError> {
    return this.findUniqueRecord(args).andThen((record) =>
      record
        ? ok(record)
        : err(
            new EntityNotFoundError({
              entityName: this.entityName,
              entityId: JSON.stringify(args.where),
            }),
          ),
    );
  }

  protected findFirstRecord(
    args: Parameters<TDelegate['findFirst']>[0],
  ): DomainResultAsync<TDbModel | null, never> {
    return ResultAsync.fromPromise(this.delegate.findFirst({ ...args }), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'findFirstRecord', error);
    });
  }

  protected getFirstRecord(
    args: Parameters<TDelegate['findFirst']>[0] & {
      where: Record<string, unknown>;
    },
  ): DomainResultAsync<TDbModel, EntityNotFoundError> {
    return this.findFirstRecord(args).andThen((record) =>
      record
        ? ok(record)
        : err(
            new EntityNotFoundError({
              entityName: this.entityName,
              entityId: JSON.stringify(args.where),
            }),
          ),
    );
  }

  protected findManyRecords(
    args: Parameters<TDelegate['findMany']>[0],
  ): DomainResultAsync<TDbModel[], never> {
    return ResultAsync.fromPromise(this.delegate.findMany({ ...args }), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'findManyRecords', error);
    });
  }

  protected findManyPaginatedRecords(
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
    options: PaginationOptions,
  ): DomainResultAsync<PaginatedResult<TDbModel>, never> {
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
      (error) => {
        throw new UnexpectedPrismaErrorException(
          this.constructor.name,
          'findManyPaginatedRecords',
          error,
        );
      },
    ).map(([items, totalItems]) =>
      createPaginatedResult({
        items,
        totalItems,
        options,
      }),
    );
  }

  protected countRecords(
    args: Parameters<TDelegate['count']>[0]['where'],
  ): DomainResultAsync<number, never> {
    return ResultAsync.fromPromise(this.delegate.count({ where: args }), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'countRecords', error);
    });
  }

  protected existsRecord(
    args: Parameters<TDelegate['count']>[0]['where'],
  ): DomainResultAsync<boolean, never> {
    return this.countRecords(args).map((count) => count > 0);
  }

  protected createRecord(
    args: Parameters<TDelegate['create']>[0],
  ): DomainResultAsync<TDbModel, EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.create(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createRecord', error);
    });
  }

  protected createManyRecords(
    args: Parameters<TDelegate['createMany']>[0],
  ): DomainResultAsync<void, EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.createMany(args), (error) => {
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

          return new EntityConflictError({
            entityName: args.data[0]?.constructor.name || 'UnknownAggregate',
            conflicts: details,
          });
        }
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createManyRecords', error);
    }).map(() => undefined);
  }

  protected updateRecord(
    args: Parameters<TDelegate['update']>[0],
  ): DomainResultAsync<TDbModel, EntityNotFoundError | EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.update(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025(args.where.id as ModelId, error);
        if (notFoundResult) return notFoundResult;

        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateRecord', error);
    });
  }

  protected updateManyRecords(
    args: Parameters<TDelegate['updateMany']>[0],
  ): DomainResultAsync<number, EntityConflictError> {
    return ResultAsync.fromPromise(this.delegate.updateMany(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(args.data as Record<string, unknown>, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateManyRecords', error);
    }).map((result) => result.count);
  }

  protected deleteRecord(
    args: Parameters<TDelegate['delete']>[0],
  ): DomainResultAsync<void, EntityNotFoundError> {
    return ResultAsync.fromPromise(this.delegate.delete(args), (error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025(args.where.id as ModelId, error);
        if (notFoundResult) return notFoundResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteRecord', error);
    }).map(() => undefined);
  }

  protected deleteManyRecords(
    args: Parameters<TDelegate['deleteMany']>[0],
  ): DomainResultAsync<number, never> {
    return ResultAsync.fromPromise(this.delegate.deleteMany(args), (error) => {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteManyRecords', error);
    }).map((result) => result.count);
  }
}
