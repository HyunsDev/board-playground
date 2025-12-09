import z from 'zod';

import { ManagerRole } from './manager.enums';

import { BoardDtoSchema } from '@/contracts/board';
import { UserSummaryDtoSchema } from '@/contracts/user';

export const ManagerDtoSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  userId: z.string().uuid(),
  role: ManagerRole,
  createdAt: z.string().datetime(),
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
