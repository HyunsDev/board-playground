import z from 'zod';

import { DevicePlatform } from './device.enums';

import { ID } from '@/common';

export const DeviceDtoSchema = z.object({
  id: ID,
  userId: ID,
  deviceIdentifier: z.string(),
  name: z.string(),
  os: z.string(),
  device: z.string(),
  browser: z.string(),
  platform: DevicePlatform,
  lastRefreshedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});
