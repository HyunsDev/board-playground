import { z } from 'zod';

import { withPagination, paginatedResultSchemaOf } from '@workspace/common';
import { UserIdSchema, UserEmailSchema, UsernameSchema } from '@workspace/domain';

import { UserAdminDtoSchema } from '../user.dto';
import { UserRole, UserStatus } from '../user.enums';

import { ACCESS } from '@/common/access';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getUserForAdmin = c.query({
  method: 'GET',
  path: '/admin/users/:userId',
  pathParams: z.object({
    userId: UserIdSchema,
  }),
  responses: {
    200: z.object({
      user: UserAdminDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
  },
  metadata: {
    access: ACCESS.admin,
  },
});

export const queryUsersForAdmin = c.query({
  method: 'GET',
  path: '/admin/users',
  query: withPagination(
    z.object({
      userId: UserIdSchema.optional(),
      email: UserEmailSchema.optional(),
      username: UsernameSchema.optional(),
      nickname: z.string().min(2).max(20).optional(),
      role: UserRole.optional(),
      status: UserStatus.optional(),
    }),
  ),
  responses: {
    200: paginatedResultSchemaOf(UserAdminDtoSchema),
  },
  metadata: {
    access: ACCESS.admin,
  },
});

export const updateUserForAdmin = c.mutation({
  method: 'PATCH',
  path: '/admin/users/:userId',
  pathParams: z.object({
    userId: UserIdSchema,
  }),
  body: z.object({
    nickname: z.string().min(2).max(20).optional(),
    username: UsernameSchema.optional(),
    bio: z.string().max(160).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
    status: UserStatus.optional(),
    role: UserRole.optional(),
  }),
  responses: {
    200: z.object({
      user: UserAdminDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
  },
  metadata: {
    access: ACCESS.admin,
  },
});

export const deleteUserForAdmin = c.mutation({
  method: 'DELETE',
  path: '/admin/users/:userId',
  pathParams: z.object({
    userId: UserIdSchema,
  }),
  body: c.noBody(),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
  },
  metadata: {
    access: ACCESS.admin,
  },
});
