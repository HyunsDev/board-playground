import { extractEnumValues, type ExtractEnumValues } from '@workspace/common';

import type { BCCodeEnumKey } from './bounded-context-code.enums.js';
import type { ValidateDomainCodes } from './internal/validate-domain-codes.utils.js';

const defineAggregateCodeEnum = <const T extends { [K in BCCodeEnumKey]: Record<string, unknown> }>(
  codes: T & ValidateDomainCodes<T>,
) => codes;

// ========================= [ CORE DEFINITION ] ========================= //

export const AggregateCodeEnum = defineAggregateCodeEnum({
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

// ======================================================================= //

export type AggregateCodeEnum = typeof AggregateCodeEnum;
export const AggregateCodes = extractEnumValues(AggregateCodeEnum);
export type AggregateCode = ExtractEnumValues<AggregateCodeEnum>;
