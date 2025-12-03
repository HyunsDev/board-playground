import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, Result } from 'neverthrow';

import { DomainEventDispatcher } from './domain-event.dispatcher';
class TransactionRollbackError<E> extends Error {
  constructor(public readonly originalError: E) {
    super('ROLLBACK');
  }
}

@Injectable()
export class TransactionManager {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async run<T, E>(operation: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
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
          this.eventDispatcher.clear();
          throw error;
        }
      });
      await this.eventDispatcher.dispatchAll();
      return result;
    } catch (error) {
      if (error instanceof TransactionRollbackError) {
        return err(error.originalError);
      }
      this.eventDispatcher.clear();
      throw error;
    }
  }
}
