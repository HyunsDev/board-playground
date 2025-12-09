import { z } from 'zod';

import { DevicePlatform, SessionStatus } from './session.enums';

import { ID } from '@/common';

export const SessionBaseDtoSchema = z.object({
  id: ID,
  userId: ID,
  name: z.string(),
  os: z.string(),
  device: z.string(),
  browser: z.string(),
  platform: DevicePlatform,
  lastRefreshedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  expiresAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  closedAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullable(),
  revokedAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .nullable(),
  status: SessionStatus,
});
export type SessionBaseDto = z.infer<typeof SessionBaseDtoSchema>;

export const SessionDtoSchema = SessionBaseDtoSchema;
export type SessionDto = z.infer<typeof SessionDtoSchema>;
