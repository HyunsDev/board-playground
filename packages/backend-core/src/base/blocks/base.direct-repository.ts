import { Logger } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';

import {
  EntityNotFoundError,
  EntityConflictError,
  DirectRepositoryPort,
} from '@workspace/backend-ddd';
import {
  createPaginatedResult,
  getPaginationSkip,
  PaginatedResult,
  PaginationOptions,
} from '@workspace/common';
import { PrismaClient, Prisma } from '@workspace/database';

import { UnexpectedPrismaErrorException } from '../core.exceptions';
import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

/**
 * Entity, Mapper, EventPublisher를 거치지 않고
 * DB 레코드에 직접 접근하는 Repository의 기본 구현체
 */
export abstract class BaseDirectRepository<
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel>,
> implements DirectRepositoryPort<TDbModel> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txContext: TransactionContext,
    protected readonly logger: Logger,
  ) {}

  protected get entityName(): string {
    return this.constructor.name.replace('Repository', '');
  }

  protected get client(): PrismaClient | Prisma.TransactionClient {
    if (this.txContext.txHost.isTransactionActive()) {
      return this.txContext.txHost.tx as unknown as Prisma.TransactionClient;
    }
    return this.prisma;
  }

  protected abstract get delegate(): TDelegate;

  async findOneById(id: string): Promise<TDbModel | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ?? null;
  }

  protected async findManyPaginatedRecord(
    options: PaginationOptions,
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
  ): Promise<PaginatedResult<TDbModel>> {
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

    return createPaginatedResult({
      items: records,
      totalItems,
      options,
    });
  }

  protected async findOneEntity(
    args: Omit<Parameters<TDelegate['findUnique']>[0], 'where'> & {
      where: Record<string, unknown>;
    },
  ): Promise<TDbModel | null> {
    const record = await this.delegate.findUnique({
      ...args,
    });
    return record ?? null;
  }

  protected async getOneRecord(
    args: Omit<Parameters<TDelegate['findUnique']>[0], 'where'> & {
      where: Record<string, unknown>;
    },
  ): Promise<Result<TDbModel, EntityNotFoundError>> {
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
    return ok(record);
  }

  protected async findAllRecords(
    args: Omit<Parameters<TDelegate['findMany']>[0], 'skip' | 'take'>,
  ): Promise<TDbModel[]> {
    const records = await this.delegate.findMany({
      ...args,
    });
    return records;
  }

  protected async countRecords(
    args: Omit<Parameters<TDelegate['count']>[0], 'where'>,
  ): Promise<number> {
    const count = await this.delegate.count({
      ...args,
    });
    return count;
  }

  protected async existsRecord(
    args: Omit<Parameters<TDelegate['count']>[0], 'where'>,
  ): Promise<boolean> {
    const count = await this.delegate.count({
      ...args,
    });
    return count > 0;
  }

  protected async createRecord(
    data: Parameters<TDelegate['create']>[0]['data'],
  ): Promise<Result<TDbModel, EntityConflictError>> {
    try {
      const result = await this.delegate.create({ data });
      return ok(result);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const conflictResult = this.handleP2002(data, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createRecord', error);
    }
  }

  protected async createManyRecords(
    data: Parameters<TDelegate['createMany']>[0]['data'],
    options?: { skipDuplicates?: boolean },
  ): Promise<Result<void, EntityConflictError>> {
    try {
      await this.delegate.createMany({
        data,
        skipDuplicates: options?.skipDuplicates,
      });
      return ok(undefined);
    } catch (error) {
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
              entityName: data[0]?.constructor.name || 'UnknownAggregate',
              conflicts: details,
            }),
          );
        }
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'createManyRecords', error);
    }
  }

  protected async updateRecord(
    id: string,
    data: Parameters<TDelegate['update']>[0]['data'],
  ): Promise<Result<TDbModel, EntityNotFoundError | EntityConflictError>> {
    try {
      const result = await this.delegate.update({
        where: { id },
        data,
      });
      return ok(result);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025(id, error);
        if (notFoundResult) return notFoundResult;

        const conflictResult = this.handleP2002(data, error);
        if (conflictResult) return conflictResult;
      }

      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateRecord', error);
    }
  }

  protected async updateManyRecords(
    where: Parameters<TDelegate['updateMany']>[0]['where'],
    data: Parameters<TDelegate['updateMany']>[0]['data'],
  ): Promise<Result<number, Error>> {
    try {
      const { count } = await this.delegate.updateMany({
        where,
        data,
      });
      return ok(count);
    } catch (error) {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateManyRecords', error);
    }
  }

  protected async deleteRecord(id: string): Promise<Result<void, EntityNotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id },
      });
      return ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const notFoundResult = this.handleP2025(id, error);
        if (notFoundResult) return notFoundResult;
      }
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteRecord', error);
    }
  }

  protected async deleteManyRecords(
    where: Parameters<TDelegate['deleteMany']>[0]['where'],
  ): Promise<Result<number, Error>> {
    try {
      const { count } = await this.delegate.deleteMany({ where });
      return ok(count);
    } catch (error) {
      throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteManyRecords', error);
    }
  }

  private handleP2025(id: string, error: Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return err(
        new EntityNotFoundError({
          entityName: this.entityName,
          entityId: id,
        }),
      );
    }
  }

  private handleP2002(data: Record<string, unknown>, error: Prisma.PrismaClientKnownRequestError) {
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
