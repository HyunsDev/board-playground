import { z } from 'zod';

import { UsernameSchema } from '@workspace/common';

import { ApiErrors } from '../api-errors';

import { ACCESS } from '@/common';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const checkUsernameAvailability = c.query({
  method: 'GET',
  path: '/auth/username/availability',
  query: z.object({
    username: UsernameSchema,
  }),
  responses: {
    200: z.object({
      available: z.boolean(),
    }),
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

export const refreshAccessToken = c.mutation({
  method: 'POST',
  path: '/auth/refresh',
  body: c.noBody(),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    ...toApiErrorResponses([
      ApiErrors.Auth.SessionExpired,
      ApiErrors.Auth.SessionRevoked,
      ApiErrors.Auth.SessionClosed,
      ApiErrors.Auth.RefreshTokenInvalid,
      ApiErrors.Auth.RefreshTokenMissing,
      ApiErrors.Auth.RefreshTokenReuseDetected,
    ]),
  },
  metadata: {
    access: ACCESS.public,
  },
});
