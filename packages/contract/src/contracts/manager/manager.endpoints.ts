import z from 'zod';

import { ManagerWithBoardDtoSchema, ManagerWithUserDtoSchema } from './manager.dto';
import { ManagerRole } from './manager.enums';

import { c, ID, toApiErrorResponses } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { BoardSlug } from '@/contracts/board/board.schemas';
import { USER_ROLE } from '@/contracts/user';

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
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
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
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
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
    ...toApiErrorResponses([ApiErrors.Manager.Forbidden]),
    ...toApiErrorResponses([ApiErrors.Board.NotFound, ApiErrors.User.NotFound]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
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
      ApiErrors.Manager.Forbidden,
      ApiErrors.Board.NotFound,
      ApiErrors.User.NotFound,
      ApiErrors.Manager.NotFound,
    ]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
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
      ApiErrors.Manager.Forbidden,
      ApiErrors.Board.NotFound,
      ApiErrors.User.NotFound,
      ApiErrors.Manager.NotFound,
    ]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
