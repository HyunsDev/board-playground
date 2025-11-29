import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { DeviceRepositoryPort } from '../../database/device.repository.port';
import { DEVICE_REPOSITORY } from '../../device.di-tokens';
import { DeviceEntity } from '../../domain/device.entity';
import { DeviceNotFoundException } from '../../domain/device.exceptions';

import { QueryBase } from '@/shared/ddd';

export class GetDeviceQuery extends QueryBase<GetDeviceQueryResult> {
  constructor(public readonly deviceId: string) {
    super();
  }
}
export type GetDeviceQueryResult = Result<DeviceEntity, DeviceNotFoundException>;

@QueryHandler(GetDeviceQuery)
export class GetDeviceQueryHandler implements IQueryHandler<GetDeviceQuery, GetDeviceQueryResult> {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
  ) {}

  async execute(query: GetDeviceQuery): Promise<GetDeviceQueryResult> {
    const device = await this.deviceRepo.findOneById(query.deviceId);
    if (!device) return err(new DeviceNotFoundException());
    return ok(device);
  }
}
