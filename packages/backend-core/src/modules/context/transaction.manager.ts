import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err } from 'neverthrow';

import {
  DomainError,
  AbstractDomainEventPublisherPort,
  DomainResult,
  AbstractJobDispatcherPort,
} from '@workspace/backend-ddd';

class TransactionRollbackError<E> extends Error {
  originalError: E;
  constructor(readonly error: E) {
    super('ROLLBACK');
    this.originalError = error;
  }
}

@Injectable()
export class TransactionManager {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly eventDispatcher: AbstractDomainEventPublisherPort,
    private readonly jobDispatcher: AbstractJobDispatcherPort,
  ) {}

  async run<Res extends DomainResult<unknown, DomainError>>(
    operation: () => Promise<Res>,
  ): Promise<Res> {
    try {
      const result = await this.txHost.withTransaction(async () => {
        try {
          const res = await operation();
          if (res.isErr()) {
            throw new TransactionRollbackError(res.error);
          }
          return res;
        } catch (error) {
          if (error instanceof TransactionRollbackError) {
            throw error;
          }
          // 예측하지 못한 에러 발생 시 이벤트를 비웁니다.
          this.eventDispatcher.clear();
          this.jobDispatcher.clear();
          throw error;
        }
      });

      // 트랜잭션이 성공적으로 커밋된 후에만 이벤트를 발행합니다 (Transactional Outbox 패턴의 단순화)
      await this.eventDispatcher.flush();
      await this.jobDispatcher.flush();

      return result;
    } catch (error) {
      this.eventDispatcher.clear();
      this.jobDispatcher.clear();
      if (error instanceof TransactionRollbackError) {
        return err(error.originalError) as Res;
      }
      throw error;
    }
  }
}
