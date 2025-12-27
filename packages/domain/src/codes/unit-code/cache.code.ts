import type { Brand } from '@workspace/common';

import type { UnitCode, ValidateUnitCode } from './unit-code.utils';

export type CacheCodeType = 'cac';
export type CacheCode<T extends string = string> = Brand<UnitCode<T, 'cac'>, 'CacheCode'>;
export const asCacheCode = <const T extends string>(
  code: ValidateUnitCode<T, 'cac'>,
): CacheCode<T> => code as unknown as CacheCode<T>;
