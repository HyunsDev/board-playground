import z from 'zod';

import { UserForAdminDtoSchema } from '../user.dto';
import { USER_ROLE, UserRole, UserStatus } from '../user.enums';

import { c, paginatedQueryOf, paginatedResponseOf } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';

export const getUserForAdmin = c.query({
  method: 'GET',
  path: '/admin/users/:userId',
  pathParams: c.type<{ userId: string }>(),
  responses: {
    200: z.object({
      user: UserForAdminDtoSchema,
    }),
    404: toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN],
  },
});

export const queryUsersForAdmin = c.query({
  method: 'GET',
  path: '/admin/users',
  query: paginatedQueryOf(
    z.object({
      userId: z.string().uuid().optional(),
      email: z.string().email().optional(),
      username: z.string().min(3).max(30).optional(),
      nickname: z.string().min(2).max(20).optional(),
      role: UserRole.optional(),
      status: UserStatus.optional(),
    }),
  ),
  responses: {
    200: paginatedResponseOf(UserForAdminDtoSchema),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN],
  },
});

export const updateUserForAdmin = c.mutation({
  method: 'PATCH',
  path: '/admin/users/:userId',
  pathParams: c.type<{ userId: string }>(),
  body: z.object({
    nickname: z.string().min(2).max(20).optional(),
    username: z.string().min(3).max(30).optional(),
    bio: z.string().max(160).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    status: UserStatus.optional(),
    role: UserRole.optional(),
  }),
  responses: {
    200: z.object({
      user: UserForAdminDtoSchema,
    }),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN],
  },
});

export const deleteUserForAdmin = c.mutation({
  method: 'DELETE',
  path: '/admin/users/:userId',
  pathParams: z.object({
    userId: z.string(),
  }),
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN],
  },
});
