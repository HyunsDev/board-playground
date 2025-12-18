import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class TransactionContext {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  isTransactionActive(): boolean {
    const { txHost } = this;
    return txHost?.isTransactionActive() ?? false;
  }

  getTx() {
    return this.txHost?.tx;
  }
}
