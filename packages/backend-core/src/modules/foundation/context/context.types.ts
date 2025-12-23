/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClsStore } from 'nestjs-cls';

import { Prisma } from '@workspace/database';
import { TokenPayload } from '@workspace/domain';

import { BaseDomainEvent, BaseIntegrationEvent, BaseJob, DrivenMessageMetadata } from '@/base';

export interface CoreStore {
  requestId: string;
  errorCode?: string;
}

export interface TokenStore {
  token?: TokenPayload;
}

export interface ClientStore {
  client?: {
    ipAddress: string;
    userAgent: string;
  };
}

export interface TransactionStore {
  transaction?: Prisma.TransactionClient;
}

export interface MessageMetadataStore {
  messageMetadata?: DrivenMessageMetadata;
}

export interface OutboxStore {
  outbox: {
    jobs: BaseJob<any>[];
    domainEvents: BaseDomainEvent<any>[];
    integrationEvents: BaseIntegrationEvent<any>[];
  };
}

export type AppStore = ClsStore &
  CoreStore &
  TokenStore &
  ClientStore &
  TransactionStore &
  MessageMetadataStore &
  OutboxStore;
