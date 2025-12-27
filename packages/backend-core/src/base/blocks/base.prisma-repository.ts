import { EntityConflictError, EntityNotFoundError } from '@workspace/backend-ddd';
import { Prisma, PrismaClient } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

/**
 * Prisma 기반 리포지토리들이 공통으로 사용하는 트랜잭션/오류 처리 로직을 모아둔 베이스 클래스
 */
export abstract class BasePrismaRepository<TDelegate extends AbstractCrudDelegate<unknown>> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txContext: TransactionContext,
  ) {}

  protected abstract get delegate(): TDelegate;

  protected get entityName(): string {
    return this.constructor.name.replace('Repository', '');
  }

  /**
   * 현재 트랜잭션이 활성화되어 있으면 트랜잭션 클라이언트를 사용합니다.
   */
  protected get client(): PrismaClient | Prisma.TransactionClient {
    if (this.txContext.txHost.isTransactionActive()) {
      return this.txContext.txHost.tx as unknown as Prisma.TransactionClient;
    }
    return this.prisma;
  }

  protected handleP2002(
    data: Record<string, unknown> | undefined,
    error: Prisma.PrismaClientKnownRequestError,
  ): EntityConflictError | undefined {
    if (error.code !== 'P2002') return;

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

  protected handleP2025(
    id: ModelId | undefined,
    error: Prisma.PrismaClientKnownRequestError,
  ): EntityNotFoundError | undefined {
    if (error.code !== 'P2025') return;

    return new EntityNotFoundError({
      entityName: this.entityName,
      entityId: id || undefined,
    });
  }
}
