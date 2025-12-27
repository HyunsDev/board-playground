import { z } from 'zod';

import { paginatedResultSchemaOf, withPagination } from '@workspace/common';
import { CommentIdSchema, PostIdSchema } from '@workspace/domain';

import { CommentDtoSchema, CreateCommentDtoSchema, UpdateCommentDtoSchema } from './comment.dto';

import { ACCESS } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { USER_ROLE } from '@/contracts/user';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getComment = c.query({
  method: 'GET',
  path: '/comments/:commentId',
  pathParams: z.object({
    commentId: CommentIdSchema,
  }),
  responses: {
    200: z.object({
      comment: CommentDtoSchema,
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
  queryParams: withPagination(
    z.object({
      postId: PostIdSchema,
    }),
  ),
  responses: {
    200: paginatedResultSchemaOf(CommentDtoSchema),
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
      comment: CommentDtoSchema,
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
    commentId: CommentIdSchema,
  }),
  body: UpdateCommentDtoSchema,
  responses: {
    200: z.object({
      comment: CommentDtoSchema,
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
    commentId: CommentIdSchema,
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
