import z from 'zod';

export const DEVICE_PLATFORM = {
  WEB: 'WEB',
  OTHER: 'OTHER',
} as const;
export const DevicePlatform = z.enum(DEVICE_PLATFORM);
export type DevicePlatform = z.infer<typeof DevicePlatform>;
