import { extractEnumValues, type CodeLiteral, type ExtractEnumValues } from '@workspace/common';

const defineBCCodeEnum = <const T extends Record<string, string>>(codes: {
  [K in keyof T]: CodeLiteral<T[K], 1>;
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
