import type { UnitCode, ValidateUnitCode } from './unit-code.utils.js';

export type MessageType = 'cmd' | 'evt' | 'qry' | 'job' | 'trg';

// Message Code Types
export type CommandCode<T extends string = string> = UnitCode<T, 'cmd'>;
export type QueryCode<T extends string = string> = UnitCode<T, 'qry'>;
export type DomainEventCode<T extends string = string> = UnitCode<T, 'evt'>;
export type JobCode<T extends string = string> = UnitCode<T, 'job'>;
export type MessageCode<T extends string = string> = UnitCode<T, MessageType>;
export type CausationCode<T extends string = string> = MessageCode<T>;

/**
 * Command 코드를 정의하고 검증합니다.
 * @example const code = asCommandCode('account:user:cmd:create');
 */
export const asCommandCode = <const T extends string>(
  code: ValidateUnitCode<T, 'cmd'>,
): ValidateUnitCode<T, 'cmd'> => code as unknown as T & ValidateUnitCode<T, 'cmd'>;

/**
 * Domain Event 코드를 정의하고 검증합니다.
 * @example const code = asDomainEventCode('account:user:evt:created');
 */
export const asDomainEventCode = <const T extends string>(
  code: ValidateUnitCode<T, 'evt'>,
): ValidateUnitCode<T, 'evt'> => code as unknown as T & ValidateUnitCode<T, 'evt'>;

/**
 * Query 코드를 정의하고 검증합니다.
 * @example const code = asQueryCode('account:user:qry:get_by_id');
 */
export const asQueryCode = <const T extends string>(
  code: ValidateUnitCode<T, 'qry'>,
): ValidateUnitCode<T, 'qry'> => code as unknown as T & ValidateUnitCode<T, 'qry'>;

/**
 * Job 코드를 정의하고 검증합니다.
 * @example const code = asJobCode('account:user:job:process');
 */
export const asJobCode = <const T extends string>(
  code: ValidateUnitCode<T, 'job'>,
): ValidateUnitCode<T, 'job'> => code as unknown as T & ValidateUnitCode<T, 'job'>;

/**
 * Message 코드를 정의하고 검증합니다. MessageType는 `'cmd' | 'evt' | 'qry' | 'job' | 'trg'` 입니다.
 * @example const code = asMessageCode('account:user:cmd:create');
 */
export const asMessageCode = <const T extends string>(
  code: ValidateUnitCode<T, MessageType>,
): ValidateUnitCode<T, MessageType> => code as unknown as T & ValidateUnitCode<T, MessageType>;
