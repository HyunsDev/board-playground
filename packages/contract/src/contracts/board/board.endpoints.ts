import { z } from 'zod';

import { withPagination, paginatedResultSchemaOf } from '@workspace/common';

import { BoardDtoSchema, CreateBoardDtoSchema, UpdateBoardDtoSchema } from './board.dto';

import { ApiErrors } from '@/contracts/api-errors';
import { USER_ROLE } from '@/contracts/user/user.enums';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

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
    ...toApiErrorResponses([ApiErrors.Board.NotFound]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const searchBoards = c.query({
  method: 'GET',
  path: '/boards',
  query: withPagination(
    z.object({
      q: z.string().min(1).max(50).optional(),
    }),
  ),
  responses: {
    200: paginatedResultSchemaOf(BoardDtoSchema),
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
    ...toApiErrorResponses([ApiErrors.Board.SlugAlreadyExists, ApiErrors.Board.NotFound]),
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
    ...toApiErrorResponses([ApiErrors.Board.PermissionDenied, ApiErrors.Board.NotFound]),
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
    ...toApiErrorResponses([ApiErrors.Board.PermissionDenied, ApiErrors.Board.NotFound]),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
