import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsService } from 'nestjs-cls';

import { UserRole } from '@workspace/contract';

import { ClientContext, AppContext, TokenContext } from './context.types';

import { CreateMessageMetadata } from '@/shared/base';
import { CausationCodes } from '@/shared/codes/causation.codes';

@Injectable()
export class ContextService {
  constructor(
    private readonly cls: ClsService<AppContext>,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  // --- Request ID ---
  getRequestId(): string {
    return this.cls.getId();
  }

  // --- Trigger Type ---
  getTriggerType() {
    return this.cls.get('triggerType');
  }

  // --- Token ---
  setToken(token: TokenContext) {
    this.cls.set('token', token);
  }

  getToken(): TokenContext | undefined {
    return this.cls.get('token');
  }

  getUserId(): string | undefined {
    return this.getToken()?.sub;
  }

  getUserRole(): UserRole | undefined {
    return this.getToken()?.role;
  }

  // --- Client Info ---

  setClient(client: ClientContext) {
    this.cls.set('client', client);
  }

  getClient(): ClientContext | undefined {
    return this.cls.get('client');
  }

  public isTransactionActive(): boolean {
    return this.txHost.isTransactionActive();
  }

  public getTx() {
    return this.txHost.tx;
  }

  // --- error code ---
  setErrorCode(code: string) {
    this.cls.set('errorCode', code);
  }

  getErrorCode(): string | undefined {
    return this.cls.get('errorCode');
  }

  // --- message metadata ---
  setMessageMetadata(metadata: CreateMessageMetadata) {
    this.cls.set('messageMetadata', metadata);
  }

  getMessageMetadata(): CreateMessageMetadata | undefined {
    const metadata = this.cls.get('messageMetadata');
    return (
      metadata || {
        causationId: this.getRequestId(),
        causationType: CausationCodes.Infra.HttpRequest,
        correlationId: this.getRequestId(),
        userId: this.getUserId() || null,
      }
    );
  }

  // --- Run in Context ---
  async runInContext<T>(fn: () => Promise<T>): Promise<T> {
    return this.cls.runWith(this.cls.get(), fn);
  }
}
