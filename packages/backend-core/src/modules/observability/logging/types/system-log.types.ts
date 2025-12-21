import { DomainCode } from '@workspace/domain';

import { BaseLogData } from './base-log.types';
import { LogTypeEnum } from '../log.enums';

export const SystemLogActionEnum = {
  AppInitialize: 'APP_INITIALIZE',
  InvariantViolation: 'INVARIANT_VIOLATION',
  ExternalCallFailed: 'EXTERNAL_CALL_FAILED',
  ResourceExhausted: 'RESOURCE_EXHAUSTED',
  InternalError: 'INTERNAL_ERROR',

  PrismaError: 'PRISMA_ERROR',
  RedisError: 'REDIS_ERROR',

  UnknownError: 'UNKNOWN_ERROR',

  // Devtools
  DevtoolsUsage: 'DEVTOOLS_USAGE',

  // Test
  Test: 'TEST',
} as const;
export type SystemLogAction = (typeof SystemLogActionEnum)[keyof typeof SystemLogActionEnum];

export interface SystemLogData extends BaseLogData {
  type: LogTypeEnum['System'];
  domain: DomainCode;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  error?: Error | unknown;
}
