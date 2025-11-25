import z from 'zod';

import { BaseException } from '@/common';

export const toExceptionSchema = <const T extends BaseException>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
  });
};
