import {
  extractEnumValues,
  safeDeepMerge,
  uniqueDeepMerge,
  type ExtractEnumValues,
} from '@workspace/common';

import type { BCCodeEnumKey } from './bounded-context-code.enums.js';
import type { ValidateDomainCodes } from './internal/validate-domain-codes.utils.js';

const defineDomainCodeEnum = <const T extends { [K in BCCodeEnumKey]: Record<string, unknown> }>(
  codes: T & ValidateDomainCodes<T>,
) => codes;

// ========================= [ CORE DEFINITION ] ========================= //

export const AggregateCodeEnum = defineDomainCodeEnum({
  Account: {
    User: 'account:user',
    Session: 'account:session',
  },
  Community: {
    Board: 'community:board',
    Post: 'community:post',
    Comment: 'community:comment',
    Manager: 'community:manager',
  },
  System: {},
});

export const TaskQueueCodeEnum = defineDomainCodeEnum({
  Account: {},
  Community: {},
  System: {
    Storage: 'system:storage',
    Test: 'system:test',
    Mail: 'system:mail',
    AuditLog: 'system:audit_log',
  },
});

export const DomainCodeEnums = uniqueDeepMerge(
  safeDeepMerge(AggregateCodeEnum, TaskQueueCodeEnum),
  defineDomainCodeEnum({
    Account: {
      Auth: 'account:auth',
    },
    Community: {},
    System: {
      Lifecycle: 'system:lifecycle',
      Infra: 'system:infra',
      Exception: 'system:exception',
      Devtools: 'system:devtools',
      Notification: 'system:notification',
    },
  }),
);

// ======================================================================= //

// AggregateCodeEnum
export type AggregateCodeEnum = typeof AggregateCodeEnum;
export const AggregateCodes = extractEnumValues(AggregateCodeEnum);
export type AggregateCode = ExtractEnumValues<AggregateCodeEnum>;

// TaskQueueCodeEnum
export type TaskQueueCodeEnum = typeof TaskQueueCodeEnum;
export const TaskQueueCodes = extractEnumValues(TaskQueueCodeEnum);
export type TaskQueueCode = ExtractEnumValues<TaskQueueCodeEnum>;

// DomainCodeEnums
export type DomainCodeEnums = typeof DomainCodeEnums;
export type DomainCodeEnumKeyEnum = {
  [K in keyof typeof DomainCodeEnums]: keyof (typeof DomainCodeEnums)[K];
};
export const DomainCodes = extractEnumValues(DomainCodeEnums);
export type DomainCode = ExtractEnumValues<DomainCodeEnums>;
