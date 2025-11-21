import { BaseException } from 'common/interfaces/exception.interface';
import z from 'zod';

export const toExceptionSchema = <const T extends BaseException>(exception: T) => {
  return z.object({
    status: z.literal(exception.status),
    code: z.literal(exception.code),
    message: z.literal(exception.message),
  });
};
