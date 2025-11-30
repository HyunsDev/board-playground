import { BadRequestError, NotFoundError } from '@/shared/base';

export class DeviceNotFoundError extends NotFoundError {
  constructor() {
    super('Device not found', 'DEVICE_NOT_FOUND');
  }
}

export class InvalidTokenError extends BadRequestError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}
