import { z } from 'zod';

import { ApiErrorResponseBody } from '../types';
import { toExceptionSchema } from './toExceptionSchema';

type ErrorResponseMap<T extends ApiErrorResponseBody> = {
  [K in T['status']]: z.ZodType<{
    status: K;
    code: Extract<T, { status: K }>['code'];
    message: string;
    details?: unknown;
  }>;
};

export const errorSchemas = <const T extends readonly ApiErrorResponseBody[]>(exceptions: T) => {
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
  return responses as unknown as ErrorResponseMap<T[number]>;
};
