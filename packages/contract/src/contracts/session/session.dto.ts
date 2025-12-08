import z from 'zod';

import { DevicePlatform, SessionStatus } from './session.enums';

import { ID } from '@/common';

export const SessionDtoSchema = z.object({
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
  status: SessionStatus,
});
export type SessionDto = z.infer<typeof SessionDtoSchema>;
