import z from 'zod';

// TODO: Exception 처리 관련해서 더 고민해보기

export const exceptionResponseSchema = z.object({
  code: z.string(),
  status: z.number(),
  message: z.string(),
  details: z.any().optional(),
});
export type ExceptionResponse = z.infer<typeof exceptionResponseSchema>;

export const exceptionResponseOf = <C extends string>({
  code,
  status,
}: {
  code: C;
  status: number;
  message?: z.ZodString;
  details?: z.ZodOptional<z.ZodAny>;
}) => {
  return z.object({
    code: z.literal(code),
    status: z.literal(status),
    message: z.string(),
    details: z.any().optional(),
  });
};