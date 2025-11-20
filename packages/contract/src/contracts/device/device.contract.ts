import { c } from 'common';

import { deleteDevice, getDevice, listDevices } from './device.endpoints';

export const deviceContract = c.router({
  get: getDevice,
  list: listDevices,
  delete: deleteDevice,
});
