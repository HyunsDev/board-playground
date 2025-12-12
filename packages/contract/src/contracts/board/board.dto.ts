import { z } from 'zod';

import { BoardSlug } from './board.schemas';

import { ID } from '@/common';

export const BoardDtoSchema = z.object({
  id: ID,
  slug: BoardSlug,
  name: z.string().min(3).max(50),
  description: z.string().max(200).nullable(),
  managerId: ID,
  createdAt: z.iso.datetime(),
});
export type BoardDto = z.infer<typeof BoardDtoSchema>;

export const CreateBoardDtoSchema = z.object({
  slug: BoardSlug,
  name: z.string().min(3).max(50),
  description: z.string().max(200).nullable(),
});
export type CreateBoardDto = z.infer<typeof CreateBoardDtoSchema>;

export const UpdateBoardDtoSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(200).nullable().optional(),
});
export type UpdateBoardDto = z.infer<typeof UpdateBoardDtoSchema>;
