import { z } from 'zod';

import { ID } from '@/common';

export const CommandDtoSchema = z.object({
  id: ID,
  postId: ID,
  authorId: ID,
  parentCommentId: ID.nullable(),
  childrenIds: z.array(ID),
  depth: z.number().min(0).max(2),
  content: z.string().min(1).max(500),
  isEdited: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type CommandDto = z.infer<typeof CommandDtoSchema>;

export const CreateCommentDtoSchema = z.object({
  postId: ID,
  parentCommentId: ID.optional(),
  content: z.string().min(1).max(500),
});
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;

export const UpdateCommentDtoSchema = z.object({
  content: z.string().min(1).max(500),
});
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
