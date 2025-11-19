import { c, paginatedQueryOf, paginatedResponseOf, USER_ROLE } from 'common';
import { exceptionResponseOf } from 'common/exception';
import z from 'zod';

import { BoardDtoSchema, CreateBoardDtoSchema, UpdateBoardDtoSchema } from '../board.dto';
import { BOARD_EXCEPTION } from '../board.exceptions';

export const getBoard = c.query({
  method: 'GET',
  path: '/boards/:boardSlug',
  pathParams: z.object({
    boardSlug: z.string(),
  }),
  responses: {
    200: z.object({
      board: BoardDtoSchema,
    }),
    404: exceptionResponseOf(BOARD_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const searchBoards = c.query({
  method: 'GET',
  path: '/boards',
  query: paginatedQueryOf(
    z.object({
      q: z.string().min(1).max(50).optional(),
    }),
  ),
  responses: {
    200: paginatedResponseOf(BoardDtoSchema),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const createBoard = c.mutation({
  method: 'POST',
  path: '/boards',
  body: CreateBoardDtoSchema,
  responses: {
    200: z.object({
      board: BoardDtoSchema,
    }),
    400: exceptionResponseOf(BOARD_EXCEPTION.SLUG_ALREADY_EXISTS),
    404: exceptionResponseOf(BOARD_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const updateBoard = c.mutation({
  method: 'PATCH',
  path: '/boards/:boardSlug',
  pathParams: z.object({
    boardSlug: z.string(),
  }),
  body: UpdateBoardDtoSchema,
  responses: {
    200: z.object({
      board: BoardDtoSchema,
    }),
    403: exceptionResponseOf(BOARD_EXCEPTION.BOARD_PERMISSION_DENIED),
    404: exceptionResponseOf(BOARD_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const deleteBoard = c.mutation({
  method: 'DELETE',
  path: '/boards/:boardSlug',
  body: c.noBody(),
  pathParams: z.object({
    boardSlug: z.string(),
  }),
  responses: {
    200: z.object({
      board: BoardDtoSchema,
    }),
    403: exceptionResponseOf(BOARD_EXCEPTION.BOARD_PERMISSION_DENIED),
    404: exceptionResponseOf(BOARD_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
