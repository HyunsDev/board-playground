import { z } from 'zod';

import { UserEmailSchema, UserIdSchema, UsernameSchema } from '@workspace/domain';

import { UserRole, UserStatus } from './user.enums';

export const UserBaseDtoSchema = z.object({
  id: UserIdSchema,
  email: UserEmailSchema,
  username: UsernameSchema,
  nickname: z.string().min(2).max(20),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.url().nullable(),
  role: UserRole,
  status: UserStatus,

  lastActiveAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
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

export const UserAdminDtoSchema = UserBaseDtoSchema.pick({
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
  updatedAt: true,
  deletedAt: true,
  adminMemo: true,
});
export type UserAdminDto = z.infer<typeof UserAdminDtoSchema>;
