import z from 'zod';

import { ApiErrorResponseBody } from '../types';

export const toExceptionSchema = <const T extends ApiErrorResponseBody>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
    details: z.any().optional(),
  });
};
