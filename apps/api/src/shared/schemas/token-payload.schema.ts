import z from 'zod';

import { UserRole } from '@workspace/contract';

export const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: UserRole,
  email: z.string().email(),
  sessionId: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
