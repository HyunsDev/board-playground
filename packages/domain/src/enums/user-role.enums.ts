import z from 'zod';

import type { ExtractEnumValues } from '@workspace/common';

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export const UserRoleSchema = z.nativeEnum(UserRole);
export type UserRole = ExtractEnumValues<typeof UserRole>;
