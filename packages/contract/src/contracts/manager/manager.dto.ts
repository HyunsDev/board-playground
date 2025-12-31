import { z } from 'zod';

import { UserIdSchema } from '@workspace/domain';
import { BoardIdSchema, ManagerIdSchema } from '@workspace/domain';

import { ManagerRole } from './manager.enums';

import { BoardDtoSchema } from '@/contracts/board';
import { UserSummaryDtoSchema } from '@/contracts/user';

export const ManagerDtoSchema = z.object({
  id: ManagerIdSchema,
  boardId: BoardIdSchema,
  userId: UserIdSchema,
  role: ManagerRole,
  createdAt: z.iso.datetime(),
});
export type ManagerDto = z.infer<typeof ManagerDtoSchema>;

export const ManagerWithBoardDtoSchema = ManagerDtoSchema.extend({
  board: BoardDtoSchema,
});
export type ManagerWithBoardDto = z.infer<typeof ManagerWithBoardDtoSchema>;

export const ManagerWithUserDtoSchema = ManagerDtoSchema.extend({
  user: UserSummaryDtoSchema,
});
export type ManagerWithUserDto = z.infer<typeof ManagerWithUserDtoSchema>;
