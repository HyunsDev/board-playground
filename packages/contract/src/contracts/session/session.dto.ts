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
  lastRefreshedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  status: SessionStatus,
});
export type SessionBaseDto = z.infer<typeof SessionBaseDtoSchema>;

export const SessionDtoSchema = SessionBaseDtoSchema.pick({
  id: true,
  userId: true,
  name: true,
  os: true,
  device: true,
  browser: true,
  platform: true,
  lastRefreshedAt: true,
  expiresAt: true,
  createdAt: true,
  closedAt: true,
  revokedAt: true,
  status: true,
});
export type SessionDto = z.infer<typeof SessionDtoSchema>;
