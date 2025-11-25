import z from 'zod';

import { passwordSchema } from './auth.schemas';

export const registerAuthReqDto = z.object({
  email: z.string().email(),
  password: passwordSchema,
  username: z.string().min(3).max(30),
  nickname: z.string().min(2).max(20),
});
