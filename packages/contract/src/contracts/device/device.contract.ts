import { deleteDevice, getDevice, listDevices } from './device.endpoints';

import { c } from '@/common';


export const deviceContract = c.router({
  get: getDevice,
  list: listDevices,
  delete: deleteDevice,
});
