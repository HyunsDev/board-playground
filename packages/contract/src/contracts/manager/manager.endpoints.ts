import { z } from 'zod';

import { UserEmailSchema, UserIdSchema } from '@workspace/common';
import { BoardSlugSchema } from '@workspace/domain';

import { ManagerWithBoardDtoSchema, ManagerWithUserDtoSchema } from './manager.dto';

import { ACCESS } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const listManagersOfBoard = c.query({
  method: 'GET',
  path: '/boards/:boardSlug/managers',
  pathParams: z.object({
    boardSlug: BoardSlugSchema,
  }),
  responses: {
    200: z.object({
      managers: z.array(ManagerWithUserDtoSchema),
    }),
    ...toApiErrorResponses([ApiErrors.Board.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const listManagerOfMe = c.query({
  method: 'GET',
  path: '/me/managers',
  pathParams: z.object({
    userId: UserIdSchema,
  }),
  responses: {
    200: z.object({
      managers: z.array(ManagerWithBoardDtoSchema),
    }),
    ...toApiErrorResponses([ApiErrors.User.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const appointManagerToBoard = c.mutation({
  method: 'POST',
  path: '/boards/:boardSlug/managers',
  pathParams: z.object({
    boardSlug: BoardSlugSchema,
  }),
  body: z.object({
    targetUserEmail: UserEmailSchema,
  }),
  responses: {
    200: z.object({
      manager: ManagerWithUserDtoSchema,
    }),
    ...toApiErrorResponses([
      ApiErrors.Manager.NotMainManager,
      ApiErrors.Board.NotFound,
      ApiErrors.User.NotFound,
      ApiErrors.Manager.AlreadyManager,
    ]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const dismissManagerFromBoard = c.mutation({
  method: 'DELETE',
  path: '/boards/:boardSlug/managers/:userId',
  body: c.noBody(),
  pathParams: z.object({
    boardSlug: BoardSlugSchema,
    userId: UserIdSchema,
  }),
  responses: {
    204: c.noBody(),
    ...toApiErrorResponses([
      ApiErrors.Manager.NotMainManager,
      ApiErrors.Board.NotFound,
      ApiErrors.User.NotFound,
      ApiErrors.Manager.NotFound,
    ]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const transferMainManager = c.mutation({
  method: 'PATCH',
  path: '/boards/:boardSlug/managers/:userId/transfer-main-manager',
  pathParams: z.object({
    boardSlug: BoardSlugSchema,
    userId: UserIdSchema,
  }),
  body: c.noBody(),
  responses: {
    200: z.object({
      manager: ManagerWithUserDtoSchema,
    }),
    ...toApiErrorResponses([
      ApiErrors.Manager.NotMainManager,
      ApiErrors.Board.NotFound,
      ApiErrors.User.NotFound,
      ApiErrors.Manager.NotFound,
    ]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});
