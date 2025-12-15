import { ClsStore } from 'nestjs-cls';

import { AbstractDrivenMessageMetadata } from '@workspace/backend-ddd';
import { Prisma } from '@workspace/database';
import { CausationCode, DomainCode, UserRole } from '@workspace/domain';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageMetadataContext = AbstractDrivenMessageMetadata<CausationCode<any>, DomainCode>;

export interface AppContext extends ClsStore {
  requestId: string;
  triggerType?: TriggerCode; // TriggerCode 타입을 직접 쓰거나 string으로 완화
  client?: ClientContext;
  token?: TokenContext;
  transaction?: Prisma.TransactionClient;
  errorCode?: string;
  messageMetadata?: MessageMetadataContext;
}
