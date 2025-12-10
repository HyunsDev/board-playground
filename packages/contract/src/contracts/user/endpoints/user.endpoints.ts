import z from 'zod';

import { UserPublicProfileDtoSchema } from '../user.dto';

import { paginatedQueryOf, paginatedResponseOf } from '@/common';
import { ACCESS } from '@/common/access';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getUser = c.query({
  method: 'GET',
  path: '/users/:userId',
  pathParams: z.object({
    userId: z.string().uuid(),
  }),
  responses: {
    200: z.object({
      user: UserPublicProfileDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
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
    200: paginatedResponseOf(UserPublicProfileDtoSchema),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
