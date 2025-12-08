import z from 'zod';

import { UserRole } from '@/contracts/user/user.enums';

export const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: UserRole,
  email: z.string().email(),
  sessionId: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
