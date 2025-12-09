import { Ok, ok } from 'neverthrow';

import { InternalServerErrorException } from '../base';

export type TypedData<T extends string, D extends Record<string, unknown> & { type?: never }> = {
  type: T;
} & D;

export const typedOk = <
  const T extends string,
  const D extends Record<string, unknown> & { type?: never },
>(
  type: T,
  data: D,
): Ok<TypedData<T, D>, never> => {
  return ok({
    type,
    ...data,
  });
};

// 입력값은 최소한 type 필드를 가지고 있어야 함
type Variant = { type: string };

export function matchType<
  V extends Variant,
  // H: 핸들러 맵. V의 type들을 키로 가짐
  const H extends {
    [Type in V['type']]: (data: Extract<V, { type: Type }>) => any;
  },
>(
  variant: V,
  handlers: H & {
    // 모든 type에 대한 핸들러가 존재하는지 타입 레벨에서 체크
    [K in keyof H]: K extends V['type'] ? unknown : never;
  },
): ReturnType<H[keyof H]> {
  const handler = handlers[variant.type as keyof H];
  if (!handler) {
    throw new InternalServerErrorException(`No handler for variant type: ${variant.type}`);
  }
  return (handler as any)(variant);
}
