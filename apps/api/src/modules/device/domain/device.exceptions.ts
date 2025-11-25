import { EXCEPTION } from '@workspace/contract';

import { NotFoundException } from '@/libs/exceptions';

export class DeviceNotFoundException extends NotFoundException {
  code = EXCEPTION.DEVICE.NOT_FOUND.code;
  constructor() {
    super(EXCEPTION.DEVICE.NOT_FOUND.message, EXCEPTION.DEVICE.NOT_FOUND.code);
  }
}
