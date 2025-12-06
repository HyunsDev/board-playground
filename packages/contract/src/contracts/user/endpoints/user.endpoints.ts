import z from 'zod';

import { UserDtoSchema } from '../user.dto';

import { c, paginatedQueryOf, paginatedResponseOf, toApiErrorResponses } from '@/common';
import { ACCESS } from '@/common/access';
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
    ...toApiErrorResponses([EXCEPTION.USER.NOT_FOUND]),
  },
  metadata: {
    access: ACCESS.signedIn,
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
    access: ACCESS.signedIn,
  },
});
