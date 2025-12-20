import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class TransactionContext {
  constructor(private readonly _txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  isTransactionActive(): boolean {
    return this._txHost?.isTransactionActive() ?? false;
  }

  get tx() {
    return this._txHost?.tx;
  }

  get txHost(): TransactionHost<TransactionalAdapterPrisma> {
    return this._txHost;
  }
}
