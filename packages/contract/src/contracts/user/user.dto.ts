import z from 'zod';

import { UserRole, UserStatus } from './user.enums';

import { ID } from '@/common';

export const UserDtoSchema = z.object({
  id: ID,
  username: z.string().min(3).max(30),
  nickname: z.string().min(2).max(20),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.string().url().nullable(),
  role: UserRole,
  status: UserStatus,
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserSummaryDtoSchema = UserDtoSchema.pick({
  id: true,
  username: true,
  nickname: true,
  avatarUrl: true,
});
export type UserSummaryDto = z.infer<typeof UserSummaryDtoSchema>;

export const UserForAdminDtoSchema = UserDtoSchema.extend({
  email: z.string().email(),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  memo: z.string().max(500).nullable(),
});
export type UserForAdminDto = z.infer<typeof UserForAdminDtoSchema>;
