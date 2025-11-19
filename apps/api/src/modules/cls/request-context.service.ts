import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { Prisma } from '@workspace/db/dist';

@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService) {}

  getContext(): ClsService {
    return this.cls;
  }

  // ---- requestId ----
  setRequestId(id: string) {
    this.cls.set('requestId', id);
  }

  getRequestId(): string | undefined {
    return this.cls.get('requestId');
  }

  // ---- Prisma 트랜잭션 공유 ----
  setTransactionClient(tx: Prisma.TransactionClient) {
    this.cls.set('transaction', tx);
  }

  getTransactionClient(): Prisma.TransactionClient | undefined {
    return this.cls.get('transaction');
  }

  clearTransactionClient() {
    this.cls.set('transaction', undefined);
  }
}
