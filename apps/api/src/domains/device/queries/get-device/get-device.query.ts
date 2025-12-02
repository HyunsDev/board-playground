import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DeviceRepositoryPort } from '../../database/device.repository.port';
import { DEVICE_REPOSITORY } from '../../device.di-tokens';
import { DeviceEntity } from '../../domain/device.entity';
import { DeviceNotFoundError } from '../../domain/device.errors';

import { QueryBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class GetDeviceQuery extends QueryBase<GetDeviceQueryResult> {
  constructor(public readonly deviceId: string) {
    super();
  }
}
export type GetDeviceQueryResult = DomainResult<DeviceEntity, DeviceNotFoundError>;

@QueryHandler(GetDeviceQuery)
export class GetDeviceQueryHandler implements IQueryHandler<GetDeviceQuery, GetDeviceQueryResult> {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
  ) {}

  async execute(query: GetDeviceQuery): Promise<GetDeviceQueryResult> {
    const device = await this.deviceRepo.findOneById(query.deviceId);
    if (!device) return err(new DeviceNotFoundError());
    return ok(device);
  }
}
