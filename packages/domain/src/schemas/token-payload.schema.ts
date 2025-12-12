import z from 'zod';

import { UserRoleSchema } from './user-role.schema';

export const TokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: UserRoleSchema,
  email: z.string().email(),
  sessionId: z.string(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
