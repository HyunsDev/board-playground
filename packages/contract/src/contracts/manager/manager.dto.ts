import { BoardDtoSchema } from 'contracts/board';
import { UserDtoSchema } from 'contracts/user';
import z from 'zod';

import { ManagerRole } from './manager.enums';

export const ManagerDtoSchema = z.object({
  id: z.uuid(),
  boardId: z.uuid(),
  userId: z.uuid(),
  role: ManagerRole,
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});
export type ManagerDto = z.infer<typeof ManagerDtoSchema>;

export const ManagerWithBoardDtoSchema = ManagerDtoSchema.extend({
  board: BoardDtoSchema,
});
export type ManagerWithBoardDto = z.infer<typeof ManagerWithBoardDtoSchema>;

export const ManagerWithUserDtoSchema = ManagerDtoSchema.extend({
  user: UserDtoSchema,
});
export type ManagerWithUserDto = z.infer<typeof ManagerWithUserDtoSchema>;
