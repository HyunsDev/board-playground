import { z } from 'zod';

import { UserIdSchema } from '@workspace/common';
import { CommentIdSchema, PostIdSchema } from '@workspace/domain';

export const CommentDtoSchema = z.object({
  id: CommentIdSchema,
  postId: PostIdSchema,
  authorId: UserIdSchema,
  parentCommentId: CommentIdSchema.nullable(),
  childrenIds: z.array(CommentIdSchema),
  depth: z.number().min(0).max(2),
  content: z.string().min(1).max(500),
  isEdited: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type CommandDto = z.infer<typeof CommentDtoSchema>;

export const CreateCommentDtoSchema = z.object({
  postId: PostIdSchema,
  parentCommentId: CommentIdSchema.optional(),
  content: z.string().min(1).max(500),
});
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;

export const UpdateCommentDtoSchema = z.object({
  content: z.string().min(1).max(500),
});
export type UpdateCommentDto = z.infer<typeof UpdateCommentDtoSchema>;
