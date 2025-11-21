import { c, exceptionResponseOf } from 'common';
import z from 'zod';

import { registerAuthReqDto } from './auth.dto';
import { AUTH_EXCEPTION } from './auth.exceptions';
import { passwordSchema } from './auth.schemas';

export const registerAuth = c.mutation({
  method: 'POST',
  path: '/auth/register',
  body: registerAuthReqDto,
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    400: exceptionResponseOf(AUTH_EXCEPTION.EMAIL_ALREADY_EXISTS),
  },
});

export const loginAuth = c.mutation({
  method: 'POST',
  path: '/auth/login',
  body: z.object({
    email: z.email(),
    password: passwordSchema,
  }),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    400: exceptionResponseOf(AUTH_EXCEPTION.INVALID_CREDENTIALS),
  },
});

export const logoutAuth = c.mutation({
  method: 'POST',
  path: '/auth/logout',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
});

export const refreshTokenAuth = c.mutation({
  method: 'POST',
  path: '/auth/refresh-token',
  body: c.noBody(),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
  },
});
