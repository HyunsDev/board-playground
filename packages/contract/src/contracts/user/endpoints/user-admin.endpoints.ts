import { c, paginatedQueryOf, paginatedResponseOf } from 'common';
import { EXCEPTION } from 'contracts/exception';
import { USER_ROLE } from 'contracts/user';
import { toExceptionSchema } from 'common/utils/toExceptionSchema';
import z from 'zod';

import { UserForAdminDtoSchema } from '../user.dto';
import { UserRole, UserStatus } from '../user.enums';

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
      userId: z.uuid().optional(),
      email: z.email().optional(),
      username: z.string().min(3).max(30).optional(),
      nickname: z.string().min(2).max(20).optional(),
      role: z.enum(['USER', 'ADMIN']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']).optional(),
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
    avatarUrl: z.url().nullable().optional(),
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
