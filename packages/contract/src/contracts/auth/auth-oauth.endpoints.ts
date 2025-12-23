import { z } from 'zod';

import { ApiErrors } from '../api-errors';

import { ACCESS } from '@/common';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const oAuthAuthStart = c.mutation({
  method: 'POST',
  path: '/auth/oauth/start',
  body: z.object({
    provider: z.enum(['google']),
    redirectUrl: z.url(),
  }),
  responses: {
    200: z.object({
      authorizationUrl: z.string(),
    }),
    ...toApiErrorResponses([ApiErrors.Auth.InvalidRedirectUrl]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const oAuthGoogleCallback = c.mutation({
  method: 'POST',
  path: '/auth/oauth/google/callback',
  body: z.object({
    idToken: z.string(),
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

export const stepUpWithOAuthStart = c.mutation({
  method: 'POST',
  path: '/auth/stepup/oauth/start',
  body: z.object({
    provider: z.enum(['google']),
    redirectUrl: z.url(),
  }),
  responses: {
    200: z.object({
      authorizationUrl: z.string(),
    }),
    ...toApiErrorResponses([ApiErrors.Auth.InvalidRedirectUrl]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const stepUpWithOAuthGoogleCallback = c.mutation({
  method: 'POST',
  path: '/auth/stepup/oauth/google/callback',
  body: z.object({
    idToken: z.string(),
  }),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.Auth.InvalidCredentials]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
