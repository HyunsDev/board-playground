import z from 'zod';

import { registerAuthReqDto } from './auth.dto';
import { EXCEPTION } from '../exception';
import { passwordSchema } from './auth.schemas';

import { ACCESS, c, toExceptionSchemas } from '@/common';

export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/auth/register',
    body: registerAuthReqDto,
    responses: {
      200: z.object({
        accessToken: z.string(),
      }),
      ...toExceptionSchemas([
        EXCEPTION.USER.EMAIL_ALREADY_EXISTS,
        EXCEPTION.USER.USERNAME_ALREADY_EXISTS,
        EXCEPTION.COMMON.VALIDATION_ERROR,
      ]),
    },
    metadata: {
      access: ACCESS.public,
    },
  },

  login: {
    method: 'POST',
    path: '/auth/login',
    body: z.object({
      email: z.string().email(),
      password: passwordSchema,
    }),
    responses: {
      200: z.object({
        accessToken: z.string(),
      }),
      ...toExceptionSchemas([EXCEPTION.AUTH.INVALID_CREDENTIALS]),
    },
    metadata: {
      access: ACCESS.public,
    },
  },

  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: c.noBody(),
    responses: {
      204: c.noBody(),
    },
    metadata: {
      access: ACCESS.public,
    },
  },

  refreshToken: {
    method: 'POST',
    path: '/auth/refresh-token',
    body: c.noBody(),
    responses: {
      200: z.object({
        accessToken: z.string(),
      }),
      ...toExceptionSchemas([
        EXCEPTION.AUTH.REFRESH_TOKEN_INVALID,
        EXCEPTION.AUTH.SESSION_EXPIRED,
        EXCEPTION.AUTH.SESSION_REVOKED,
        EXCEPTION.AUTH.SESSION_CLOSED,
        EXCEPTION.AUTH.REFRESH_TOKEN_MISSING,
        EXCEPTION.AUTH.REFRESH_TOKEN_REUSE_DETECTED,
      ]),
    },
    metadata: {
      access: ACCESS.public,
    },
  },
});
