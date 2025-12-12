import z from 'zod';

import { UserPrivateProfileDtoSchema } from '../user.dto';

import { ACCESS } from '@/common/access';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getUserMe = c.query({
  method: 'GET',
  path: '/me',
  responses: {
    200: z.object({
      me: UserPrivateProfileDtoSchema,
    }),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const updateUserMeProfile = c.mutation({
  method: 'PATCH',
  path: '/me/profile',
  body: z.object({
    nickname: z.string().min(2).max(20).optional(),
    bio: z.string().max(160).nullable().optional(),
  }),
  responses: {
    200: z.object({
      me: UserPrivateProfileDtoSchema,
    }),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const updateUserMeAvatar = c.mutation({
  method: 'PUT',
  path: '/me/avatar',
  body: {
    avatar: c.file(),
  },
  contentType: 'multipart/form-data',
  responses: {
    200: z.object({
      me: UserPrivateProfileDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.User.InvalidProfileImage]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const updateUserMeUsername = c.mutation({
  method: 'PUT',
  path: '/me/username',
  body: z.object({
    username: z.string().min(3).max(30),
  }),
  responses: {
    200: z.object({
      me: UserPrivateProfileDtoSchema,
    }),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const deleteUserMe = c.mutation({
  method: 'DELETE',
  path: '/me',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
    ...toApiErrorResponses([ApiErrors.User.AdminCannotBeDeleted]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
