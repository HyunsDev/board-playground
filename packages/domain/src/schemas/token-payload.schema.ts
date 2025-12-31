import { z } from 'zod';

import { UserRoleSchema } from './user-role.schema';

import { SessionIdSchema, UserEmailSchema, UserIdSchema } from '@/ids';

export const TokenPayloadSchema = z.object({
  sub: UserIdSchema,
  role: UserRoleSchema,
  email: UserEmailSchema,
  sessionId: SessionIdSchema,
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
