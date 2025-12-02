import z from 'zod';

import { ApiErrorResponse } from '../types';

export const toExceptionSchema = <const T extends ApiErrorResponse>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
    details: z.any().optional(),
  });
};
