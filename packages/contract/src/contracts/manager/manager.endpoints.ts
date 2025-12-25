import { z } from 'zod';

import { ManagerWithBoardDtoSchema, ManagerWithUserDtoSchema } from './manager.dto';
import { ManagerRole } from './manager.enums';

import { ACCESS, ID } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { BoardSlug } from '@/contracts/board/board.schemas';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const listManagersOfBoard = c.query({
  method: 'GET',
  path: '/boards/:boardSlug/managers',
  pathParams: z.object({
    boardSlug: BoardSlug,
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
    userId: ID,
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
    boardSlug: BoardSlug,
  }),
  body: z.object({
    userId: ID,
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
    boardSlug: BoardSlug,
    userId: ID,
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

export const changeManagerRole = c.mutation({
  method: 'PATCH',
  path: '/boards/:boardSlug/managers/:userId/role',
  pathParams: z.object({
    boardSlug: BoardSlug,
    userId: ID,
  }),
  body: z.object({
    role: ManagerRole,
  }),
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
