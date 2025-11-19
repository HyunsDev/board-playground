import { BoardSlug, c, ID, USER_ROLE } from 'common';
import { MANAGER_ROLE } from 'common/enums/manager-role.enums';
import { exceptionResponseOf } from 'common/exception';
import z from 'zod';

import { ManagerWithBoardDtoSchema, ManagerWithUserDtoSchema } from './manager.dto';
import { MANAGER_EXCEPTION } from './manager.exceptions';

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
    404: exceptionResponseOf(MANAGER_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const listManagerOfUser = c.query({
  method: 'GET',
  path: '/users/:userId/managers',
  pathParams: z.object({
    userId: ID,
  }),
  responses: {
    200: z.object({
      managers: z.array(ManagerWithBoardDtoSchema),
    }),
    404: exceptionResponseOf(MANAGER_EXCEPTION.USER_NOT_FOUND),
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
    403: exceptionResponseOf(MANAGER_EXCEPTION.FORBIDDEN),
    404: z.union([
      exceptionResponseOf(MANAGER_EXCEPTION.BOARD_NOT_FOUND),
      exceptionResponseOf(MANAGER_EXCEPTION.USER_NOT_FOUND),
    ]),
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
    403: exceptionResponseOf(MANAGER_EXCEPTION.FORBIDDEN),
    404: z.union([
      exceptionResponseOf(MANAGER_EXCEPTION.BOARD_NOT_FOUND),
      exceptionResponseOf(MANAGER_EXCEPTION.USER_NOT_FOUND),
      exceptionResponseOf(MANAGER_EXCEPTION.MANAGER_NOT_FOUND),
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
    role: MANAGER_ROLE,
  }),
  responses: {
    200: z.object({
      manager: ManagerWithUserDtoSchema,
    }),
    403: exceptionResponseOf(MANAGER_EXCEPTION.FORBIDDEN),
    404: z.union([
      exceptionResponseOf(MANAGER_EXCEPTION.BOARD_NOT_FOUND),
      exceptionResponseOf(MANAGER_EXCEPTION.USER_NOT_FOUND),
      exceptionResponseOf(MANAGER_EXCEPTION.MANAGER_NOT_FOUND),
    ]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
