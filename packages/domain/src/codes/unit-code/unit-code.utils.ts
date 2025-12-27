import type { IsCodeLiteral } from '@workspace/common';

import { DomainCodeEnums, type DomainCode, type DomainCodeEnumKeyEnum } from '../domain-code.enums';

import type { BCCodeEnumKey } from '../bounded-context-code.enums';

export type UnitCode<
  T extends string,
  M extends string,
  D extends DomainCode = DomainCode,
> = T extends `${D}:${M}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? T // ✅
    : never // ❌ 케이스가 틀림
  : `${D}:${M}:${string}`;

/**
 * 메시지 코드의 구조와 케이스(Snake Case)를 검증합니다.
 * @template T - 입력된 코드 문자열
 * @template M - 메시지 타입 ('cmd' | 'evt' | 'qry')
 */
export type ValidateUnitCode<
  T extends string,
  M extends string,
  D extends DomainCode = DomainCode,
> = T extends `${D}:${M}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? T // ✅
    : `[ Error: Action '${Action}' must be lower_snake_case ]` // ❌ 케이스가 틀림
  : `${D}:${M}:`;

/**
 * @deprecated Enum 방식 대신 {@link ValidateUnitCode} 등을 사용하세요.
 */
export type ValidateUnitCodes<
  TBCCodeKey extends BCCodeEnumKey,
  TDomainCodeKey extends DomainCodeEnumKeyEnum[TBCCodeKey],
  TMessageType extends string,
  Value extends string,
> = Value extends `${DomainCodeEnums[TBCCodeKey][TDomainCodeKey] & DomainCode}:${TMessageType}:${infer MessageAction}`
  ? IsCodeLiteral<MessageAction, 1> extends true
    ? Value
    : never
  : never;
