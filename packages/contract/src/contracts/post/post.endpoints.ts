import { z } from 'zod';

import { paginatedResultSchemaOf, withPagination } from '@workspace/common';
import { BoardSlugSchema, PostIdSchema, UserIdSchema } from '@workspace/domain';

import { PostDtoSchema } from './post.dto';

import { ACCESS } from '@/common';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const getPost = c.query({
  method: 'GET',
  path: '/posts/:postId',
  pathParams: z.object({
    postId: PostIdSchema,
  }),
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.Post.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const queryPosts = c.query({
  method: 'GET',
  path: '/posts',
  query: withPagination(
    z.object({
      boardSlug: BoardSlugSchema.optional(),
      title: z.string().min(1).max(100).optional(),
      authorId: UserIdSchema.optional(),
    }),
  ),
  responses: {
    200: paginatedResultSchemaOf(PostDtoSchema),
    ...toApiErrorResponses([ApiErrors.Board.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const createPost = c.mutation({
  method: 'POST',
  path: '/posts',
  body: z.object({
    boardSlug: BoardSlugSchema,
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(5000),
  }),
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    ...toApiErrorResponses([ApiErrors.Board.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const updatePost = c.mutation({
  method: 'PATCH',
  path: '/posts/:postId',
  pathParams: z.object({
    postId: PostIdSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(5000).optional(),
  }),
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    ...toApiErrorResponses([
      ApiErrors.Post.PermissionDenied,
      ApiErrors.Post.NotFound,
      ApiErrors.Board.NotFound,
    ]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

export const deletePost = c.mutation({
  method: 'DELETE',
  path: '/posts/:postId',
  body: c.noBody(),
  pathParams: z.object({
    postId: PostIdSchema,
  }),
  responses: {
    200: z.object({
      success: z.boolean(),
    }),
    ...toApiErrorResponses([ApiErrors.Post.PermissionDenied, ApiErrors.Post.NotFound]),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});
