import { z } from 'zod';

import { type ApiError } from '@workspace/common';

type ErrorResponseMap<T extends ApiError> = {
  [K in T['status']]: z.ZodType<{
    status: K;
    code: Extract<T, { status: K }>['code'];
    message: string;
    details?: unknown;
  }>;
};

const toApiErrorResponse = <const T extends ApiError>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
    details: z.any().optional(),
  });
};

export const toApiErrorResponses = <const T extends readonly ApiError[]>(exceptions: T) => {
  const grouped = exceptions.reduce(
    (acc, ex) => {
      const { status } = ex;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(toApiErrorResponse(ex));
      return acc;
    },
    {} as Record<number, z.ZodType[]>,
  );

  const responses: Record<number, z.ZodType> = {};

  Object.entries(grouped).forEach(([statusStr, schemas]) => {
    const status = Number(statusStr);
    if (schemas.length === 1) {
      responses[status] = schemas[0] as z.ZodType;
    } else {
      responses[status] = z.union(schemas as [z.ZodType, z.ZodType, ...z.ZodType[]]);
    }
  });
  return responses as unknown as ErrorResponseMap<T[number]>;
};
