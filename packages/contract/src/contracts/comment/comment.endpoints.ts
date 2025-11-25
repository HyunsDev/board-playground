import z from 'zod';

import { CommandDtoSchema, CreateCommentDtoSchema, UpdateCommentDtoSchema } from './comment.dto';

import { c, ID, paginatedQueryOf, paginatedResponseOf } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';
import { USER_ROLE } from '@/contracts/user';


export const getComment = c.query({
  method: 'GET',
  path: '/comments/:commentId',
  pathParams: z.object({
    commentId: ID,
  }),
  responses: {
    200: z.object({
      comment: CommandDtoSchema,
    }),
    404: toExceptionSchema(EXCEPTION.COMMENT.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const listComments = c.query({
  method: 'GET',
  path: '/comments',
  queryParams: paginatedQueryOf(
    z.object({
      postId: ID,
    }),
  ),
  responses: {
    200: paginatedResponseOf(CommandDtoSchema),
    404: toExceptionSchema(EXCEPTION.POST.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const createComment = c.mutation({
  method: 'POST',
  path: '/comments',
  body: CreateCommentDtoSchema,
  responses: {
    200: z.object({
      comment: CommandDtoSchema,
    }),
    400: toExceptionSchema(EXCEPTION.COMMENT.DEPTH_EXCEEDED),
    404: toExceptionSchema(EXCEPTION.POST.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const updateComment = c.mutation({
  method: 'PUT',
  path: '/comments/:commentId',
  pathParams: z.object({
    commentId: ID,
  }),
  body: UpdateCommentDtoSchema,
  responses: {
    200: z.object({
      comment: CommandDtoSchema,
    }),
    404: toExceptionSchema(EXCEPTION.COMMENT.NOT_FOUND),
    403: toExceptionSchema(EXCEPTION.COMMENT.PERMISSION_DENIED),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const deleteComment = c.mutation({
  method: 'DELETE',
  path: '/comments/:commentId',
  pathParams: z.object({
    commentId: ID,
  }),
  body: c.noBody(),
  responses: {
    204: c.noBody(),
    404: toExceptionSchema(EXCEPTION.COMMENT.NOT_FOUND),
    403: toExceptionSchema(EXCEPTION.COMMENT.PERMISSION_DENIED),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
