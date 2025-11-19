import z from 'zod';

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export const UserRole = z.nativeEnum(USER_ROLE);
export type UserRole = z.infer<typeof UserRole>;
