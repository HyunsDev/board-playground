import z from 'zod';

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const;
export const UserStatus = z.enum(USER_STATUS);
export type UserStatus = z.infer<typeof UserStatus>;
