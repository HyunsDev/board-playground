import { z } from 'zod';

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export const UserRole = z.enum(USER_ROLE);
export type UserRole = z.infer<typeof UserRole>;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
} as const;
export const UserStatus = z.enum(USER_STATUS);
export type UserStatus = z.infer<typeof UserStatus>;
