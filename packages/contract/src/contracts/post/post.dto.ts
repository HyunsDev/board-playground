import { z } from 'zod';

import { ID } from '@/common';
import { BoardSlug } from '@/contracts/board/board.schemas';
import { UserSummaryDtoSchema } from '@/contracts/user';

export const PostDtoSchema = z.object({
  id: ID,
  boardSlug: BoardSlug,
  author: UserSummaryDtoSchema,
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  createdAt: z.iso.datetime(),
});
export type PostDto = z.infer<typeof PostDtoSchema>;
