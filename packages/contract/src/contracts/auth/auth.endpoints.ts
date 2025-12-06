import z from 'zod';

import { registerAuthReqDto } from './auth.dto';
import { passwordSchema } from './auth.schemas';

import { c } from '@/common';
import { accessRole } from '@/common/utils/access.utils';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';

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
  metadata: {
    ...accessRole.public(),
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
  metadata: {
    ...accessRole.public(),
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
    ...accessRole.public(),
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
      toExceptionSchema(EXCEPTION.AUTH.SESSION_IS_REVOKED),
    ]),
  },
  metadata: {
    ...accessRole.public(),
  },
});
