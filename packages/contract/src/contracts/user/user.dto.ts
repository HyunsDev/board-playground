import z from 'zod';

import { UserRole, UserStatus } from './user.enums';

import { ID } from '@/common';

export const UserBaseDtoSchema = z.object({
  id: ID,
  email: z.string().email(),
  username: z.string().min(3).max(30),
  nickname: z.string().min(2).max(20),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.string().url().nullable(),
  role: UserRole,
  status: UserStatus,
  memo: z.string().max(500).nullable(),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});
export type UserBaseDto = z.infer<typeof UserBaseDtoSchema>;

export const UserDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  username: true,
  nickname: true,
  bio: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserSummaryDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  username: true,
  nickname: true,
  avatarUrl: true,
});
export type UserSummaryDto = z.infer<typeof UserSummaryDtoSchema>;

export const UserForAdminDtoSchema = UserBaseDtoSchema;
export type UserForAdminDto = z.infer<typeof UserForAdminDtoSchema>;

export const UserForMeDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  email: true,
  username: true,
  nickname: true,
  bio: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
});
export type UserForMeDto = z.infer<typeof UserForMeDtoSchema>;
