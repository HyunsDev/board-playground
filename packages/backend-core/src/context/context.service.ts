import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsService } from 'nestjs-cls';

import { AppContext, ClientContext, TokenContext, MessageMetadataContext } from './context.types';

@Injectable()
export class ContextService {
  constructor(
    private readonly cls: ClsService<AppContext>,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  // --- Request ID ---
  getRequestId(): string | undefined {
    return this.cls.getId();
  }

  // --- Trigger Type ---
  setTriggerType(type: string) {
    this.cls.set('triggerType', type);
  }

  getTriggerType(): string | undefined {
    return this.cls.get('triggerType');
  }

  // --- Token (User Info) ---
  setToken(token: TokenContext) {
    this.cls.set('token', token);
  }

  getToken(): TokenContext | undefined {
    return this.cls.get('token');
  }

  getUserId(): string | undefined {
    return this.getToken()?.sub;
  }

  // --- Client Info ---
  setClient(client: ClientContext) {
    this.cls.set('client', client);
  }

  getClient(): ClientContext | undefined {
    return this.cls.get('client');
  }

  // --- Transaction ---
  public isTransactionActive(): boolean {
    return this.txHost.isTransactionActive();
  }

  public getTx() {
    return this.txHost.tx;
  }

  // --- Error Code ---
  setErrorCode(code: string) {
    this.cls.set('errorCode', code);
  }

  // --- Message Metadata (CQRS/Event) ---
  setMessageMetadata(metadata: MessageMetadataContext) {
    this.cls.set('messageMetadata', metadata);
  }

  getMessageMetadata(): MessageMetadataContext | undefined {
    return this.cls.get('messageMetadata');
  }

  // --- Run in Context ---
  async runInContext<T>(fn: () => Promise<T>): Promise<T> {
    return this.cls.runWith(this.cls.get(), fn);
  }
}
