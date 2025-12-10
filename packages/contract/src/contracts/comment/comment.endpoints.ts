import z from 'zod';

import { CommandDtoSchema, CreateCommentDtoSchema, UpdateCommentDtoSchema } from './comment.dto';

import { ACCESS, ID, paginatedQueryOf, paginatedResponseOf } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { USER_ROLE } from '@/contracts/user';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

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
    ...toApiErrorResponses([ApiErrors.Comment.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
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
    ...toApiErrorResponses([ApiErrors.Post.NotFound]),
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
    ...toApiErrorResponses([ApiErrors.Comment.DepthExceeded, ApiErrors.Post.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
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
    ...toApiErrorResponses([ApiErrors.Comment.NotFound, ApiErrors.Comment.PermissionDenied]),
  },
  metadata: {
    ...ACCESS.signedIn,
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
    ...toApiErrorResponses([ApiErrors.Comment.NotFound, ApiErrors.Comment.PermissionDenied]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});
