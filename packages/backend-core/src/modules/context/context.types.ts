import { ClsStore } from 'nestjs-cls';

import { Prisma } from '@workspace/database';
import { UserRole } from '@workspace/domain';

import { DrivenMessageMetadata } from '@/base';
import { TriggerCode } from '@/common';

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

export interface AppContext extends ClsStore {
  requestId: string;
  triggerType?: TriggerCode; // TriggerCode 타입을 직접 쓰거나 string으로 완화
  client?: ClientContext;
  token?: TokenContext;
  transaction?: Prisma.TransactionClient;
  errorCode?: string;
  messageMetadata?: DrivenMessageMetadata;
}
