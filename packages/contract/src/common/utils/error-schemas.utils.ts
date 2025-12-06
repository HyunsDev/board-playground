import { z } from 'zod';

import { ApiErrorResponseBody } from '../types';
import { toExceptionSchema } from './toExceptionSchema';

// ✅ 마법의 타입: 입력된 Exception들의 status만 쏙 뽑아서 Key로 만듭니다.
type ErrorResponseMap<T extends ApiErrorResponseBody> = {
  [K in T['status']]: z.ZodType<{
    status: K;
    code: Extract<T, { status: K }>['code']; // 해당 status를 가진 에러들의 code만 유니온으로 좁힘
    message: string;
    details?: unknown;
  }>;
};

export const errorSchemas = <const T extends readonly ApiErrorResponseBody[]>(exceptions: T) => {
  // 1. 런타임 로직 (기존과 동일)
  const grouped = exceptions.reduce(
    (acc, ex) => {
      const { status } = ex;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(toExceptionSchema(ex));
      return acc;
    },
    {} as Record<number, z.ZodTypeAny[]>,
  );

  const responses: Record<number, z.ZodTypeAny> = {};

  Object.entries(grouped).forEach(([statusStr, schemas]) => {
    const status = Number(statusStr);
    if (schemas.length === 1) {
      responses[status] = schemas[0];
    } else {
      responses[status] = z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
    }
  });

  // 2. ✅ 타입 강제 변환 (이 부분이 핵심!)
  // 런타임 값은 그대로두고, 타입만 "너는 구체적인 status 키를 가진 객체야"라고 속입니다.
  return responses as unknown as ErrorResponseMap<T[number]>;
};
