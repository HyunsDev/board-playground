import { Injectable, Optional } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsService } from 'nestjs-cls';

import { DrivenMessageMetadataNotFoundException } from './context.exceptions';
import { AppContext, ClientContext, TokenContext } from './context.types';

import { DrivenMessageMetadata } from '@/base';
import { TriggerCode } from '@/common';

@Injectable()
export class ContextService {
  constructor(
    private readonly cls: ClsService<AppContext>,
    @Optional()
    private readonly txHost?: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  // --- Request ID ---
  getRequestId(): string | undefined {
    return this.cls.get('requestId');
  }

  // --- Trigger Type ---
  setTriggerType(type: TriggerCode) {
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
  isTransactionActive(): boolean {
    const { txHost } = this;
    return txHost?.isTransactionActive() ?? false;
  }

  getTx() {
    return this.txHost?.tx;
  }

  // --- Error Code ---
  setErrorCode(code: string) {
    this.cls.set('errorCode', code);
  }

  getErrorCode(): string | undefined {
    return this.cls.get('errorCode');
  }

  // --- Message Metadata (CQRS/Event) ---
  setDrivenMessageMetadata(metadata: DrivenMessageMetadata) {
    this.cls.set('messageMetadata', metadata);
  }

  getDrivenMessageMetadata(): DrivenMessageMetadata {
    const metadata = this.cls.get('messageMetadata');
    if (!metadata) {
      throw new DrivenMessageMetadataNotFoundException();
    }
    return metadata;
  }

  getNewMessageMetadata(initialTriggerCode: TriggerCode): DrivenMessageMetadata {
    return {
      causationId: this.getRequestId() || null,
      causationType: initialTriggerCode,
      correlationId: this.getRequestId() || null,
      userId: this.getUserId() || null,
    };
  }

  // --- Run in Context ---
  async runInContext<T>(fn: () => Promise<T>): Promise<T> {
    return this.cls.runWith(this.cls.get(), fn);
  }
}
