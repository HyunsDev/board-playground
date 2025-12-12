import { z } from 'zod';

export const DEVICE_PLATFORM = {
  WEB: 'WEB',
  OTHER: 'OTHER',
} as const;
export const DevicePlatform = z.enum(DEVICE_PLATFORM);
export type DevicePlatform = z.infer<typeof DevicePlatform>;

export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  REVOKED: 'REVOKED',
} as const;
export const SessionStatus = z.enum(SESSION_STATUS);
export type SessionStatus = z.infer<typeof SessionStatus>;
