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
  lastRefreshedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  closedAt: z.iso.datetime().nullable(),
  revokedAt: z.iso.datetime().nullable(),
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
