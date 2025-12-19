import { ClsStore } from 'nestjs-cls';

import { Prisma } from '@workspace/database';
import { TokenPayload } from '@workspace/domain';

import { DrivenMessageMetadata } from '@/base';

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

export type AppStore = ClsStore &
  CoreStore &
  TokenStore &
  ClientStore &
  TransactionStore &
  MessageMetadataStore;
