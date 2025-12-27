import type { Brand } from '@workspace/common';

import type { UnitCode, ValidateUnitCode } from './unit-code.utils';

export type StoreCodeType = 'sto';
export type StoreCode<T extends string = string> = Brand<UnitCode<T, 'sto'>, 'StoreCode'>;
export const asStoreCode = <const T extends string>(
  code: ValidateUnitCode<T, 'sto'>,
): StoreCode<T> => code as unknown as StoreCode<T>;
