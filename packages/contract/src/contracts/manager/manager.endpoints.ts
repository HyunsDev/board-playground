import z from 'zod';

import { ManagerWithBoardDtoSchema, ManagerWithUserDtoSchema } from './manager.dto';
import { ManagerRole } from './manager.enums';

import { c, ID } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { BoardSlug } from '@/contracts/board/board.schemas';
import { EXCEPTION } from '@/contracts/exception';
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
    404: toExceptionSchema(EXCEPTION.BOARD.NOT_FOUND),
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
    404: toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
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
    403: toExceptionSchema(EXCEPTION.MANAGER.FORBIDDEN),
    404: z.union([
      toExceptionSchema(EXCEPTION.BOARD.NOT_FOUND),
      toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
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
    403: toExceptionSchema(EXCEPTION.MANAGER.FORBIDDEN),
    404: z.union([
      toExceptionSchema(EXCEPTION.BOARD.NOT_FOUND),
      toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
      toExceptionSchema(EXCEPTION.MANAGER.NOT_FOUND),
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
    403: toExceptionSchema(EXCEPTION.MANAGER.FORBIDDEN),
    404: z.union([
      toExceptionSchema(EXCEPTION.BOARD.NOT_FOUND),
      toExceptionSchema(EXCEPTION.USER.NOT_FOUND),
      toExceptionSchema(EXCEPTION.MANAGER.NOT_FOUND),
    ]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
