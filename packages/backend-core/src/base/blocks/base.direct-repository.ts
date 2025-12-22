/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok, Result } from 'neverthrow';

import {
  EntityNotFoundError,
  EntityConflictError,
  DirectRepositoryPort,
} from '@workspace/backend-ddd';
import { PrismaClient, Prisma } from '@workspace/database';

import { UnexpectedPrismaErrorException } from '../core.exceptions';

type AbstractCrudDelegate<R> = {
  findUnique(args: any): Promise<R | null>;
  findMany(args: any): Promise<R[]>;
  create(args: any): Promise<R>;
  createMany(args: any): Promise<{
    count: number;
  }>;
  update(args: any): Promise<R>;
  delete(args: any): Promise<R>;
  deleteMany(args: any): Promise<{ count: number }>;
  count(args: any): Promise<number>;
};

/**
 * Entity, Mapper, EventPublisher를 거치지 않고
 * DB 레코드에 직접 접근하는 Repository의 기본 구현체
 */
export abstract class BaseDirectRepository<
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel>,
> implements DirectRepositoryPort<TDbModel> {
  protected abstract get delegate(): TDelegate;

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly logger: Logger,
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

  async findOneById(id: string): Promise<TDbModel | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ?? null;
  }

  protected async safeCreate(
    data: Parameters<TDelegate['create']>[0]['data'],
  ): Promise<Result<TDbModel, EntityConflictError>> {
    try {
      const result = await this.delegate.create({ data });
      return ok(result);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (data as Record<string, unknown>)[field],
          }));

          return err(
            new EntityConflictError({
              entityName: this.constructor.name.replace('Repository', ''),
              conflicts: details,
            }),
          );
        }
      }

      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async safeCreateMany(
    data: Parameters<TDelegate['createMany']>[0]['data'],
  ): Promise<Result<void, EntityConflictError>> {
    try {
      await this.delegate.createMany({
        data,
        skipDuplicates: true, // 필요에 따라 파라미터화 가능
      });
      return ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (data as Record<string, unknown>)[field],
          }));

          return err(
            new EntityConflictError({
              entityName: this.constructor.name.replace('Repository', ''),
              conflicts: details,
            }),
          );
        }
      }

      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async safeUpdate(
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
        // Unique Constraint Violation
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details = targets.map((field) => ({
            field,
            value: (data as Record<string, unknown>)[field],
          }));

          return err(
            new EntityConflictError({
              entityName: this.constructor.name.replace('Repository', ''),
              conflicts: details,
            }),
          );
        }
        // Record Not Found (update 대상 없음)
        if (error.code === 'P2025') {
          return err(
            new EntityNotFoundError({
              entityName: this.constructor.name.replace('Repository', ''),
              entityId: id,
            }),
          );
        }
      }

      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async safeDelete(id: string): Promise<Result<void, EntityNotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id },
      });
      return ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(
          new EntityNotFoundError({
            entityName: this.constructor.name.replace('Repository', ''),
            entityId: id,
          }),
        );
      }
      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async safeDeleteMany(
    where: Parameters<TDelegate['deleteMany']>[0]['where'],
  ): Promise<Result<number, Error>> {
    try {
      const { count } = await this.delegate.deleteMany({ where });
      return ok(count);
    } catch (error) {
      throw new UnexpectedPrismaErrorException(error);
    }
  }

  protected async findById(id: string): Promise<TDbModel | null> {
    const result = await this.delegate.findUnique({ where: { id } });
    return result || null;
  }
}
