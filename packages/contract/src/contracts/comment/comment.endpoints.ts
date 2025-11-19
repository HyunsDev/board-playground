import { c, ID, paginatedQueryOf, paginatedResponseOf, USER_ROLE } from 'common';
import { exceptionResponseOf } from 'common/exception';
import z from 'zod';

import { CommandDtoSchema, CreateCommentDtoSchema, UpdateCommentDtoSchema } from './comment.dto';
import { COMMENT_EXCEPTION } from './comment.exceptions';

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
    404: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_NOT_FOUND),
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
    404: exceptionResponseOf(COMMENT_EXCEPTION.POST_NOT_FOUND),
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
    400: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_DEPTH_EXCEEDED),
    404: exceptionResponseOf(COMMENT_EXCEPTION.POST_NOT_FOUND),
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
    404: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_NOT_FOUND),
    403: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_PERMISSION_DENIED),
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
    404: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_NOT_FOUND),
    403: exceptionResponseOf(COMMENT_EXCEPTION.COMMENT_PERMISSION_DENIED),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
