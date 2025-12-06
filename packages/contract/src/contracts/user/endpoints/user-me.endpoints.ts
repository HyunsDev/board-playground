import z from 'zod';

import { UserForMeDtoSchema } from '../user.dto';

import { c, toApiErrorResponses } from '@/common';
import { ACCESS } from '@/common/access';
import { EXCEPTION } from '@/contracts/exception';

export const getUserMe = c.query({
  method: 'GET',
  path: '/me',
  responses: {
    200: z.object({
      me: UserForMeDtoSchema,
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
      me: UserForMeDtoSchema,
    }),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const updateUserMeAvatar = c.mutation({
  method: 'PUT',
  path: '/me/avatar',
  body: c.type<{ files: File[] }>(),
  contentType: 'multipart/form-data',
  responses: {
    200: z.object({
      me: UserForMeDtoSchema,
    }),
    ...toApiErrorResponses([EXCEPTION.USER.INVALID_PROFILE_IMAGE]),
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
      me: UserForMeDtoSchema,
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
    ...toApiErrorResponses([EXCEPTION.USER.NOT_FOUND]),
    ...toApiErrorResponses([EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
