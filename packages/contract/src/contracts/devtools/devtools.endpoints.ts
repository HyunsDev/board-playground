import z from 'zod';

import { EXCEPTION } from '../exception';

import { c, toExceptionSchema } from '@/common';
import { ACCESS } from '@/common/utils/access.utils';

export const forceRegisterForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/force-register',
  body: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    nickname: z.string().min(2).max(20),
  }),
  responses: {
    200: z.object({
      refreshToken: z.string(),
      accessToken: z.string(),
    }),
    400: z.union([
      toExceptionSchema(EXCEPTION.USER.EMAIL_ALREADY_EXISTS),
      toExceptionSchema(EXCEPTION.USER.USERNAME_ALREADY_EXISTS),
    ]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const forceLoginForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/force-login',
  body: z.object({
    email: z.string().email(),
  }),
  responses: {
    200: z.object({
      refreshToken: z.string(),
      accessToken: z.string(),
    }),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const resetDBForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/reset-db',
  body: c.noBody(),
  responses: {
    200: z.void(),
  },
  metadata: {
    access: ACCESS.public,
  },
});
