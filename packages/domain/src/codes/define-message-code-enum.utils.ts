import type { IsCodeLiteral } from '@workspace/common';

import {
  DomainCodeEnums,
  type DomainCode,
  type DomainCodeEnumKeyEnum,
} from './domain-code.enums.js';

import type { BCCodeEnumKey } from './bounded-context-code.enums.js';

export type MessageType = 'cmd' | 'evt' | 'qry' | 'job' | 'trg';

// ---------------------------------------------------------------------------
// 1. Base Types & Validation Logic
// ---------------------------------------------------------------------------

type MessageCode<
  T extends string,
  M extends MessageType,
> = T extends `${DomainCode}:${M}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? T // ✅
    : never // ❌ 케이스가 틀림
  : `${DomainCode}:${M}:${string}`;

export type CommandCode<T extends string = string> = MessageCode<T, 'cmd'>;
export type QueryCode<T extends string = string> = MessageCode<T, 'qry'>;
export type EventCode<T extends string = string> = MessageCode<T, 'evt'>;
export type JobCode<T extends string = string> = MessageCode<T, 'job'>;
export type CausationCode<T extends string = string> = MessageCode<
  T,
  'cmd' | 'evt' | 'job' | 'trg'
>;
// ---------------------------------------------------------------------------
// 2. Definition Utilities
// ---------------------------------------------------------------------------

/**
 * 메시지 코드의 구조와 케이스(Snake Case)를 검증합니다.
 * @template T - 입력된 코드 문자열
 * @template M - 메시지 타입 ('cmd' | 'evt' | 'qry')
 */
type ValidateCode<
  T extends string,
  M extends MessageType,
> = T extends `${DomainCode}:${M}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? T // ✅
    : `[ Error: Action '${Action}' must be lower_snake_case ]` // ❌ 케이스가 틀림
  : `${DomainCode}:${M}:`;

/**
 * Command 코드를 정의하고 검증합니다.
 * @example const code = defineCommandCode('account:user:cmd:create');
 */
export const defineCommandCode = <const T extends string>(
  code: ValidateCode<T, 'cmd'>,
): ValidateCode<T, 'cmd'> => code as unknown as T & ValidateCode<T, 'cmd'>;

/**
 * Event 코드를 정의하고 검증합니다.
 * @example const code = defineEventCode('account:user:evt:created');
 */
export const defineEventCode = <const T extends string>(
  code: ValidateCode<T, 'evt'>,
): ValidateCode<T, 'evt'> => code as unknown as T & ValidateCode<T, 'evt'>;

/**
 * Query 코드를 정의하고 검증합니다.
 * @example const code = defineQueryCode('account:user:qry:get_by_id');
 */
export const defineQueryCode = <const T extends string>(
  code: ValidateCode<T, 'qry'>,
): ValidateCode<T, 'qry'> => code as unknown as T & ValidateCode<T, 'qry'>;

/**
 * Query 코드를 정의하고 검증합니다.
 * @example const code = defineQueryCode('account:user:qry:get_by_id');
 */
export const defineJobCode = <const T extends string>(
  code: ValidateCode<T, 'job'>,
): ValidateCode<T, 'job'> => code as unknown as T & ValidateCode<T, 'job'>;

// ---------------------------------------------------------------------------
// 3. Deprecated (Legacy Support)
// ---------------------------------------------------------------------------

/**
 * @deprecated Enum 방식 대신 {@link defineCommandCode} 등을 사용하세요.
 */
export type ValidateMessageCode<
  TBCCodeKey extends BCCodeEnumKey,
  TDomainCodeKey extends DomainCodeEnumKeyEnum[TBCCodeKey],
  TMessageType extends MessageType,
  Value extends string,
> = Value extends `${DomainCodeEnums[TBCCodeKey][TDomainCodeKey] & DomainCode}:${TMessageType}:${infer MessageAction}`
  ? IsCodeLiteral<MessageAction, 1> extends true
    ? Value
    : never
  : never;
