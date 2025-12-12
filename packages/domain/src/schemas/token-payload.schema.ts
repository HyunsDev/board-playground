import { z } from 'zod';

import { UserRoleSchema } from './user-role.schema';

export const TokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: UserRoleSchema,
  email: z.email(),
  sessionId: z.string(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
