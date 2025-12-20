import z from 'zod';

import type { PascalCaseString } from '@workspace/common';

export type DefinedSSESchema<
  TCode extends string = string,
  TPayload extends z.ZodObject = z.ZodObject,
> = z.ZodObject<{
  code: z.ZodLiteral<TCode>;
  occurredAt: z.ZodString;
  payload: TPayload;
}>;

export type DefinedSSE<
  TCode extends string = string,
  TSchema extends DefinedSSESchema<TCode> = DefinedSSESchema<TCode>,
> = {
  code: TCode;
  schema: TSchema;
};

function defineSSE<const TCode extends string, const TPayload extends z.ZodObject>(data: {
  code: PascalCaseString<TCode>;
  payload: TPayload;
}): DefinedSSE<TCode, DefinedSSESchema<TCode, TPayload>> {
  return {
    code: data.code as TCode,
    schema: z.object({
      code: z.literal(data.code as unknown as TCode),
      occurredAt: z.string(),
      payload: data.payload,
    }),
  };
}

export type SSERoute = {
  [key: string]: DefinedSSE | SSERoute;
};

function SSERouter<const T extends SSERoute>(sses: T) {
  return sses;
}

export const e = {
  define: defineSSE,
  router: SSERouter,
} as const;
