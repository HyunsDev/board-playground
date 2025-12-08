import { ClsStore as NestClsStore } from 'nestjs-cls';

import { UserRole } from '@workspace/contract';
import { Prisma } from '@workspace/db';

import { CreateMessageMetadata } from '@/shared/base';
import { TriggerCode } from '@/shared/codes/trigger.codes';

export interface ClientContext {
  ipAddress: string;
  userAgent: string;
}

export interface TokenContext {
  sub: string;
  role: UserRole;
  email: string;
  sessionId: string;
}

export type MessageMetadataContext = CreateMessageMetadata;

export interface AppContext extends NestClsStore {
  triggerType: TriggerCode;
  requestId: string;
  client?: ClientContext;
  token?: TokenContext;
  transaction?: Prisma.TransactionClient;
  errorCode?: string;
  messageMetadata?: MessageMetadataContext;
}
