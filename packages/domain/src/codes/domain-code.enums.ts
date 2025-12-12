import { extractEnumValues, safeDeepMerge, type ExtractEnumValues } from '@workspace/common';

import { AggregateCodeEnum } from './aggregate-code.enums.js';

import type { BCCodeEnumKey } from './bounded-context-code.enums.js';
import type { ValidateDomainCodes } from './internal/validate-domain-codes.utils.js';

const defineDomainCodeEnum = <const T extends { [K in BCCodeEnumKey]: Record<string, unknown> }>(
  codes: T & ValidateDomainCodes<T>,
) => codes;

// ========================= [ CORE DEFINITION ] ========================= //

export const DomainCodeEnums = safeDeepMerge(
  AggregateCodeEnum,
  defineDomainCodeEnum({
    Account: {
      Auth: 'account:auth',
    },
    Community: {},
    System: {
      Infra: 'system:infra',
      Devtools: 'system:devtools',
    },
  }),
);

// ======================================================================= //

export type DomainCodeEnums = typeof DomainCodeEnums;
export type DomainCodeEnumKeyEnum = {
  [K in keyof typeof DomainCodeEnums]: keyof (typeof DomainCodeEnums)[K];
};
export const DomainCodes = extractEnumValues(DomainCodeEnums);
export type DomainCode = ExtractEnumValues<DomainCodeEnums>;
