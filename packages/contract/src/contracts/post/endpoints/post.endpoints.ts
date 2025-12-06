import z from 'zod';

import { CreatePostDtoSchema, PostDtoSchema, UpdatePostDtoSchema } from '../post.dto';

import { c, ID, paginatedQueryOf, paginatedResponseOf, toApiErrorResponses } from '@/common';
import { EXCEPTION } from '@/contracts/exception';

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
    ...toApiErrorResponses([EXCEPTION.POST.NOT_FOUND]),
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
    ...toApiErrorResponses([EXCEPTION.BOARD.NOT_FOUND]),
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
    ...toApiErrorResponses([EXCEPTION.BOARD.NOT_FOUND]),
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
    ...toApiErrorResponses([
      EXCEPTION.POST.PERMISSION_DENIED,
      EXCEPTION.POST.NOT_FOUND,
      EXCEPTION.BOARD.NOT_FOUND,
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
    ...toApiErrorResponses([EXCEPTION.POST.PERMISSION_DENIED, EXCEPTION.POST.NOT_FOUND]),
  },
  metadata: {
    roles: ['USER', 'ADMIN'],
  },
});
