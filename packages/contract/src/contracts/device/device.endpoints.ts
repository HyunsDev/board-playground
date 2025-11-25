import z from 'zod';

import { DeviceDtoSchema } from './device.dto';

import { c } from '@/common';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
import { EXCEPTION } from '@/contracts/exception';
import { USER_ROLE } from '@/contracts/user';


export const getDevice = c.query({
  method: 'GET',
  path: '/devices/:deviceId',
  pathParams: z.object({
    deviceId: z.string().uuid(),
  }),
  responses: {
    200: z.object({
      device: DeviceDtoSchema,
    }),
    404: toExceptionSchema(EXCEPTION.DEVICE.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const listDevices = c.query({
  method: 'GET',
  path: '/devices',
  responses: {
    200: z.object({
      devices: z.array(DeviceDtoSchema),
    }),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});

export const deleteDevice = c.mutation({
  method: 'DELETE',
  path: '/devices/:deviceId',
  body: c.noBody(),
  pathParams: z.object({
    deviceId: z.string().uuid(),
  }),
  responses: {
    204: z.undefined(),
    404: toExceptionSchema(EXCEPTION.DEVICE.NOT_FOUND),
  },
  metadata: {
    roles: [USER_ROLE.USER, USER_ROLE.ADMIN],
  },
});
