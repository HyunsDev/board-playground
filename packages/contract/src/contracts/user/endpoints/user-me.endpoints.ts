import { c, USER_ROLE } from 'common';
import { exceptionResponseOf } from 'common/exception';
import z from 'zod';

import { UserDtoSchema } from '../user.dto';
import { USER_EXCEPTION_CODE } from '../user.exceptions';

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

  headers: z.object({
    'Content-Type': z.literal('application/json'),
  }),
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
    400: exceptionResponseOf({
      code: USER_EXCEPTION_CODE.INVALID_PROFILE_IMAGE,
      status: 400,
    }),
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
  },
  metadata: {
    roles: [USER_ROLE.USER],
  },
});
