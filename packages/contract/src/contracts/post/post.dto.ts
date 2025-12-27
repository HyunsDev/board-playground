import { z } from 'zod';

import { BoardSlugSchema, PostIdSchema } from '@workspace/domain';

import { UserSummaryDtoSchema } from '@/contracts/user';

export const PostDtoSchema = z.object({
  id: PostIdSchema,
  boardSlug: BoardSlugSchema,
  author: UserSummaryDtoSchema,
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  createdAt: z.iso.datetime(),
});
export type PostDto = z.infer<typeof PostDtoSchema>;
