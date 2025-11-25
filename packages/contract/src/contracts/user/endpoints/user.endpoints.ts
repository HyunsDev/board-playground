import z from 'zod';

import { UserDtoSchema } from '../user.dto';
import { USER_ROLE } from '../user.enums';

import { c, paginatedQueryOf, paginatedResponseOf } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';

export const getUser = c.query({
  method: 'GET',
  path: '/users/:userId',
  pathParams: z.object({
    userId: z.string().uuid(),
  }),
  responses: {
    200: z.object({
      user: UserDtoSchema,
    }),
    404: toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
  },
});

export const searchUsers = c.query({
  method: 'GET',
  path: '/users',
  query: paginatedQueryOf(
    z.object({
      nickname: z.string().min(1).max(20).optional(),
    }),
  ),
  responses: {
    200: paginatedResponseOf(UserDtoSchema),
  },
  metadata: {
    roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
  },
});
