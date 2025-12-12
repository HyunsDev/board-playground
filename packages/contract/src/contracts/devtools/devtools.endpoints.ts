import { z } from 'zod';

import { ApiErrors } from '../api-errors';

import { ACCESS } from '@/common/access';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const forceRegisterForDev = c.mutation({
  method: 'POST',
  path: '/_devtools/force-register',
  body: z.object({
    email: z.email(),
    username: z.string().min(3).max(30),
    nickname: z.string().min(2).max(20),
  }),
  responses: {
    200: z.object({
      refreshToken: z.string(),
      accessToken: z.string(),
    }),
    ...toApiErrorResponses([
      ApiErrors.User.EmailAlreadyExists,
      ApiErrors.User.UsernameAlreadyExists,
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
    email: z.email(),
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
