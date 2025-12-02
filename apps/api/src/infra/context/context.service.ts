import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { Prisma } from '@workspace/db';

import { ClientContext, AppContext, TokenContext } from './context.types';

@Injectable()
export class ContextService {
  constructor(private readonly cls: ClsService<AppContext>) {}

  // --- Request ID ---
  getRequestId(): string {
    return this.cls.getId();
  }

  // --- Token ---
  setToken(token: TokenContext) {
    this.cls.set('token', token);
  }

  getToken(): TokenContext | undefined {
    return this.cls.get('token');
  }

  getUserId(): string | undefined {
    return this.getToken()?.id;
  }

  getUserRole(): string | undefined {
    return this.getToken()?.role;
  }

  // --- Client Info ---

  setClient(client: ClientContext) {
    this.cls.set('client', client);
  }

  getClient(): ClientContext | undefined {
    return this.cls.get('client');
  }

  // --- tx ---
  setTx(transaction: Prisma.TransactionClient) {
    this.cls.set('transaction', transaction);
  }

  getTx(): Prisma.TransactionClient | undefined {
    return this.cls.get('transaction');
  }

  clearTx() {
    this.cls.set('transaction', undefined);
  }

  // --- Run in Context ---
  async runInContext<T>(fn: () => Promise<T>): Promise<T> {
    return this.cls.runWith(this.cls.get(), fn);
  }
}
