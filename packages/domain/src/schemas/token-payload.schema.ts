import { z } from 'zod';

import { UserEmailSchema, UserIdSchema } from '@workspace/common';

import { UserRoleSchema } from './user-role.schema';

import { SessionIdSchema } from '@/ids';

export const TokenPayloadSchema = z.object({
  sub: UserIdSchema,
  role: UserRoleSchema,
  email: UserEmailSchema,
  sessionId: SessionIdSchema,
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
