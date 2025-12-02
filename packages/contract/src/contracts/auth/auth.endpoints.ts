import z from 'zod';

import { registerAuthReqDto } from './auth.dto';
import { passwordSchema } from './auth.schemas';

import { c } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';
import { USER_ROLE } from '@/contracts/user';

export const registerAuth = c.mutation({
  method: 'POST',
  path: '/auth/register',
  body: registerAuthReqDto,
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    409: z.union([
      toExceptionSchema(EXCEPTION.USER.EMAIL_ALREADY_EXISTS),
      toExceptionSchema(EXCEPTION.USER.USERNAME_ALREADY_EXISTS),
    ]),
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
    400: toExceptionSchema(EXCEPTION.AUTH.INVALID_CREDENTIALS),
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
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
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
    401: z.union([
      toExceptionSchema(EXCEPTION.AUTH.INVALID_REFRESH_TOKEN),
      toExceptionSchema(EXCEPTION.AUTH.USED_REFRESH_TOKEN),
    ]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
