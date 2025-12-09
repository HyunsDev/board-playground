import { z } from 'zod';

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

  lastActiveAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullable(),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  deletedAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullable(),

  adminMemo: z.string().max(500).nullable(),
});
export type UserBaseDto = z.infer<typeof UserBaseDtoSchema>;

export const UserPublicProfileDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  username: true,
  nickname: true,
  bio: true,
  avatarUrl: true,
  role: true,
  status: true,
  deletedAt: true,
  createdAt: true,
});
export type UserPublicProfileDto = z.infer<typeof UserPublicProfileDtoSchema>;

export const UserSummaryDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  username: true,
  nickname: true,
  avatarUrl: true,
  role: true,
});
export type UserSummaryDto = z.infer<typeof UserSummaryDtoSchema>;

export const UserPrivateProfileDtoSchema = UserBaseDtoSchema.pick({
  id: true,
  email: true,
  username: true,
  nickname: true,
  bio: true,
  avatarUrl: true,
  role: true,
  status: true,
  lastActiveAt: true,
  createdAt: true,
  deletedAt: true,
});
export type UserPrivateProfileDto = z.infer<typeof UserPrivateProfileDtoSchema>;

export const UserAdminDtoSchema = UserBaseDtoSchema;
export type UserAdminDto = z.infer<typeof UserAdminDtoSchema>;
