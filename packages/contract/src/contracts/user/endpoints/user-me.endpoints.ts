import { c } from 'common';
import { toExceptionSchema } from 'common/utils/toExceptionSchema';
import { EXCEPTION } from 'contracts/exception';
import z from 'zod';

import { UserDtoSchema } from '../user.dto';
import { USER_ROLE } from '../user.enums';

export const getUserMe = c.query({
  method: 'GET',
  path: '/users/me',
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});

export const updateUserMeProfile = c.mutation({
  method: 'PATCH',
  path: '/users/me/profile',
  body: z.object({
    nickname: z.string().min(2).max(20).optional(),
    bio: z.string().max(160).nullable().optional(),
  }),
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});

export const updateUserMeAvatar = c.mutation({
  method: 'PUT',
  path: '/users/me/avatar',
  body: c.type<{ files: File[] }>(),
  contentType: 'multipart/form-data',
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
    400: toExceptionSchema(EXCEPTION.USER.INVALID_PROFILE_IMAGE),
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});

export const updateUserMeUsername = c.mutation({
  method: 'PUT',
  path: '/users/me/username',
  body: z.object({
    username: z.string().min(3).max(30),
  }),
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});

export const deleteUserMe = c.mutation({
  method: 'DELETE',
  path: '/users/me',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
    400: toExceptionSchema(EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED),
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});
