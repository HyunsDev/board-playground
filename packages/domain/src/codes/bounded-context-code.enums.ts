import {
  extractEnumValues,
  type ExtractEnumValues,
  type Invert,
  type StrictLowerSnakeCaseString,
} from '@workspace/common';

const defineBCCodeEnum = <const T extends Record<string, string>>(codes: {
  [K in keyof T]: StrictLowerSnakeCaseString<T[K]>;
}) => {
  return codes;
};

// ========================= [ CORE DEFINITION ] ========================= //

export const BCCodeEnum = defineBCCodeEnum({
  System: 'system',
  Account: 'account',
  Community: 'community',
});

// ======================================================================= //

export type BCCodeEnum = typeof BCCodeEnum;
export type BCCodeEnumKey = keyof BCCodeEnum;
export const BCCodes = extractEnumValues(BCCodeEnum);
export type BCCode = ExtractEnumValues<BCCodeEnum>;
export type InvertedBCCodeEnum = Invert<BCCodeEnum>;
