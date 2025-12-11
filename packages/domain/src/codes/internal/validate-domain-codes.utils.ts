import type { IsStrictSnakeCase } from '@workspace/common';

import type { BCCodeEnum } from '../bounded-context-code.enums';

type ValidateDomainCode<
  TBCCode extends keyof BCCodeEnum,
  Value extends string,
> = Value extends `${BCCodeEnum[TBCCode]}:${infer Suffix}`
  ? IsStrictSnakeCase<Suffix> extends true
    ? Value
    : never // 접미사가 lower_snake_case가 아님
  : never; // 접두사가 그룹키와 맞지 않음

export type ValidateDomainCodes<T> = {
  [K in keyof T]: {
    [P in keyof T[K]]: T[K][P] extends string
      ? ValidateDomainCode<K & keyof BCCodeEnum, T[K][P]>
      : never; // 문자열이 아닌 경우
  };
};
