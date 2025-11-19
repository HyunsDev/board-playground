import { c, ID, paginatedQueryOf, paginatedResponseOf } from 'common';
import { exceptionResponseOf } from 'common/exception';
import z from 'zod';

import { CreatePostDtoSchema, PostDtoSchema, UpdatePostDtoSchema } from '../post.dto';
import { POST_EXCEPTION } from '../post.exceptions';

export const getPost = c.query({
  method: 'GET',
  path: '/posts/:postId',
  pathParams: z.object({
    postId: ID,
  }),
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    404: exceptionResponseOf(POST_EXCEPTION.POST_NOT_FOUND),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});

export const queryPosts = c.query({
  method: 'GET',
  path: '/posts',
  query: paginatedQueryOf(
    z.object({
      boardSlug: z.string().optional(),
      title: z.string().min(1).max(100).optional(),
      authorId: ID.optional(),
    }),
  ),
  responses: {
    200: paginatedResponseOf(PostDtoSchema),
    404: exceptionResponseOf(POST_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});

export const createPost = c.mutation({
  method: 'POST',
  path: '/posts',
  body: CreatePostDtoSchema,
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    404: exceptionResponseOf(POST_EXCEPTION.BOARD_NOT_FOUND),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});

export const updatePost = c.mutation({
  method: 'PATCH',
  path: '/posts/:postId',
  pathParams: z.object({
    postId: ID,
  }),
  body: UpdatePostDtoSchema,
  responses: {
    200: z.object({
      post: PostDtoSchema,
    }),
    403: exceptionResponseOf(POST_EXCEPTION.POST_PERMISSION_DENIED),
    404: z.union([
      exceptionResponseOf(POST_EXCEPTION.POST_NOT_FOUND),
      exceptionResponseOf(POST_EXCEPTION.BOARD_NOT_FOUND),
    ]),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});

export const deletePost = c.mutation({
  method: 'DELETE',
  path: '/posts/:postId',
  body: c.noBody(),
  pathParams: z.object({
    postId: ID,
  }),
  responses: {
    200: z.object({
      success: z.boolean(),
    }),
    403: exceptionResponseOf(POST_EXCEPTION.POST_PERMISSION_DENIED),
    404: exceptionResponseOf(POST_EXCEPTION.POST_NOT_FOUND),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});
