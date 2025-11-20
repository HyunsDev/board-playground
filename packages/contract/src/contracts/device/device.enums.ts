import z from 'zod';

export const DEVICE_OS = {
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WINDOWS: 'WINDOWS',
  MACOS: 'MACOS',
  LINUX: 'LINUX',
  OTHER: 'OTHER',
} as const;
export const DeviceOS = z.enum(DEVICE_OS);
export type DeviceOS = z.infer<typeof DeviceOS>;

export const DEVICE_PLATFORM = {
  WEB: 'WEB',
  OTHER: 'OTHER',
} as const;
export const DevicePlatform = z.enum(DEVICE_PLATFORM);
export type DevicePlatform = z.infer<typeof DevicePlatform>;
