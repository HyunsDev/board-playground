import z from 'zod';

import { registerAuthReqDto } from './auth.dto';
import { ApiErrors } from '../api-errors';
import { passwordSchema } from './auth.schemas';

import { ACCESS, c, toApiErrorResponses } from '@/common';

export const registerAuth = c.mutation({
  method: 'POST',
  path: '/auth/register',
  body: registerAuthReqDto,
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    ...toApiErrorResponses([
      ApiErrors.User.EmailAlreadyExists,
      ApiErrors.User.UsernameAlreadyExists,
      ApiErrors.Common.ValidationError,
    ]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const loginAuth = c.mutation({
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
    ...toApiErrorResponses([ApiErrors.Auth.InvalidCredentials]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const logoutAuth = c.mutation({
  method: 'POST',
  path: '/auth/logout',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const refreshToken = c.mutation({
  method: 'POST',
  path: '/auth/refresh-token',
  body: c.noBody(),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    ...toApiErrorResponses([
      ApiErrors.Auth.RefreshTokenInvalid,
      ApiErrors.Auth.SessionExpired,
      ApiErrors.Auth.SessionRevoked,
      ApiErrors.Auth.SessionClosed,
      ApiErrors.Auth.RefreshTokenMissing,
      ApiErrors.Auth.RefreshTokenReuseDetected,
    ]),
  },
  metadata: {
    access: ACCESS.public,
  },
});
