import { z } from 'zod';

import { withPagination, paginatedResultSchemaOf } from '@workspace/common';
import { UserIdSchema } from '@workspace/domain';

import { UserPublicProfileDtoSchema } from '../user.dto';

import { ACCESS } from '@/common/access';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getUser = c.query({
  method: 'GET',
  path: '/users/:userId',
  pathParams: z.object({
    userId: UserIdSchema,
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
  query: withPagination(
    z.object({
      nickname: z.string().min(1).max(20).optional(),
    }),
  ),
  responses: {
    200: paginatedResultSchemaOf(UserPublicProfileDtoSchema),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
