import { ClsService } from 'nestjs-cls';

import { Prisma } from '@workspace/db/dist';

export class ClsAccessor {
  private static cls: ClsService;

  static setClsService(service: ClsService) {
    this.cls = service;
  }

  static get<T = any>(key: string): T | undefined {
    return this.cls?.get(key);
  }

  static set<T = any>(key: string, value: T) {
    this.cls?.set(key, value);
  }

  static getRequestId(): string | undefined {
    return this.get<string>('requestId');
  }

  static setRequestId(id: string) {
    this.cls?.set('requestId', id);
  }
  static setTransactionClient(tx: Prisma.TransactionClient) {
    this.set('transaction', tx);
  }

  static getTransactionClient(): Prisma.TransactionClient | undefined {
    return this.get('transaction');
  }

  static clearTransactionClient() {
    this.set('transaction', undefined);
  }
}
