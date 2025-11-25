import z from 'zod';

export const MANAGER_ROLE = {
  MAIN_MANAGER: 'MAIN_MANAGER',
  SUB_MANAGER: 'SUB_MANAGER',
} as const;
export const ManagerRole = z.nativeEnum(MANAGER_ROLE);
export type ManagerRole = z.infer<typeof ManagerRole>;
