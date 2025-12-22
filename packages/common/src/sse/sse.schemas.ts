import z from 'zod';

export const createSSEMessageContract = <
  const TCode extends string,
  const TPayload extends z.ZodTypeAny,
>({
  event,
  payload,
}: {
  event: TCode;
  payload: TPayload;
}) => {
  return {
    event,
    schema: z.object({
      id: z.uuid(),
      event: z.literal(event),
      data: z.object({
        metadata: z.object({
          createdAt: z.iso.datetime(),
          userId: z.uuid().nullable(),
        }),
        payload,
      }),
    }),
  };
};

export type SSEMessageContract<TCode extends string, TPayload extends z.ZodTypeAny> = ReturnType<
  typeof createSSEMessageContract<TCode, TPayload>
>;

export type SSEMessage<TCode extends string, TPayload> = z.infer<
  ReturnType<typeof createSSEMessageContract<TCode, z.ZodType<TPayload>>>['schema']
>;
