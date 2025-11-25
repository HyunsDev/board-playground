import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from 'neverthrow';

import { DeviceRepositoryPort } from '../database/device.repository.port';
import { DEVICE_REPOSITORY } from '../device.di-tokens';
import { CreateDeviceProps, DeviceEntity } from '../domain/device.entity';

@Injectable()
export class CreateDeviceService {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
  ) {}

  async create(props: CreateDeviceProps): Promise<Result<DeviceEntity, Error>> {
    const device = DeviceEntity.create(props);
    await this.deviceRepo.insert(device);
    return ok(device);
  }
}
