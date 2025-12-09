import z from 'zod';

import { ID } from '@/common';
import { BoardSlug } from '@/contracts/board/board.schemas';
import { UserSummaryDtoSchema } from '@/contracts/user';

export const PostDtoSchema = z.object({
  id: ID,
  boardSlug: BoardSlug,
  author: UserSummaryDtoSchema,
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  createdAt: z.string().datetime(),
});
export type PostDto = z.infer<typeof PostDtoSchema>;

export const CreatePostDtoSchema = z.object({
  boardSlug: BoardSlug,
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
});
export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;

export const UpdatePostDtoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(5000).optional(),
});
export type UpdatePostDto = z.infer<typeof UpdatePostDtoSchema>;
