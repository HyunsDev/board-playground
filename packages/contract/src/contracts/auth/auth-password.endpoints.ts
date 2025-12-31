import { z } from 'zod';

import { UserEmailSchema, UsernameSchema } from '@workspace/domain';
import { EmailVerificationCodeSchema, PasswordResetCodeSchema } from '@workspace/domain';

import { ApiErrors } from '../api-errors';
import { passwordSchema } from './auth.schemas';

import { ACCESS } from '@/common';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const sendVerificationEmail = c.mutation({
  method: 'POST',
  path: '/auth/register/request-email-verification-code',
  body: z.object({
    email: UserEmailSchema,
  }),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.User.UsernameAlreadyExists]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const registerWithPassword = c.mutation({
  method: 'POST',
  path: '/auth/register/password',
  body: z.object({
    email: UserEmailSchema,
    password: passwordSchema,
    emailVerificationCode: EmailVerificationCodeSchema,
    username: UsernameSchema,
    nickname: z.string().min(2).max(20),
  }),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    ...toApiErrorResponses([
      ApiErrors.User.EmailAlreadyExists,
      ApiErrors.User.UsernameAlreadyExists,
      ApiErrors.Auth.InvalidEmailVerificationCode,
      ApiErrors.Common.ValidationError,
    ]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const loginWithPassword = c.mutation({
  method: 'POST',
  path: '/auth/login/password',
  body: z.object({
    email: UserEmailSchema,
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

export const changePassword = c.mutation({
  method: 'PUT',
  path: '/auth/password/change',
  body: z.object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    logoutAllSessions: z.boolean().optional(),
  }),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.Auth.InvalidCredentials, ApiErrors.Common.ValidationError]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const sendResetEmail = c.mutation({
  method: 'POST',
  path: '/auth/password/request-email',
  body: z.object({
    email: UserEmailSchema,
  }),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const resetPassword = c.mutation({
  method: 'POST',
  path: '/auth/password/reset',
  body: z.object({
    email: UserEmailSchema,
    newPassword: passwordSchema,
    passwordResetCode: PasswordResetCodeSchema,
  }),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.Common.ValidationError, ApiErrors.Auth.InvalidCredentials]),
  },
  metadata: {
    access: ACCESS.public,
  },
});

export const stepUpWithPassword = c.mutation({
  method: 'POST',
  path: '/auth/step-up/password',
  body: z.object({
    password: passwordSchema,
  }),
  responses: {
    200: z.object({
      expiredAt: z.iso.datetime(),
    }),
    ...toApiErrorResponses([ApiErrors.Auth.InvalidCredentials]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
