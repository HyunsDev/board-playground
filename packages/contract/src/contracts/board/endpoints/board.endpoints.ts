import z from 'zod';

import { BoardDtoSchema, CreateBoardDtoSchema, UpdateBoardDtoSchema } from '../board.dto';

import { c, paginatedQueryOf, paginatedResponseOf, toApiErrorResponses } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { USER_ROLE } from '@/contracts/user/user.enums';

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
