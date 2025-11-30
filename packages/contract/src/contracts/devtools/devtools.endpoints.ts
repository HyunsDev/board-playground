import z from 'zod';

import { UserDtoSchema } from '../user';

import { c } from '@/common';

export const createUserForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/create-user',
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    username: z.string().min(3).max(30),
    nickname: z.string().min(2).max(20),
  }),
  responses: {
    200: z.object({
      user: UserDtoSchema,
      tokens: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
    }),
  },
});

export const forceLoginForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/force-login',
  body: z.object({
    userId: z.string().uuid(),
  }),
  responses: {
    200: z.object({
      refreshToken: z.string(),
      accessToken: z.string(),
    }),
  },
});
