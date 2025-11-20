import { ID } from 'common';
import z from 'zod';

import { DeviceOS, DevicePlatform } from './device.enums';

export const DeviceDtoSchema = z.object({
  id: ID,
  userId: ID,
  name: z.string(),
  os: DeviceOS,
  platform: DevicePlatform,
  location: z.string().nullable(),
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
