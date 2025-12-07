import { ClsStore as NestClsStore } from 'nestjs-cls';

import { UserRole } from '@workspace/contract';
import { Prisma } from '@workspace/db';

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

export interface AppContext extends NestClsStore {
  requestId: string;
  client?: ClientContext;
  token?: TokenContext;
  transaction?: Prisma.TransactionClient;
  errorCode?: string;
}
