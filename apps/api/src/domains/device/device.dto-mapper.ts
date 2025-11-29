import { Injectable } from '@nestjs/common';

import { DeviceDto } from '@workspace/contract';

import { DeviceEntity } from './domain/device.entity';

import { BaseDtoMapper } from '@/shared/ddd';

@Injectable()
export class DeviceDtoMapper extends BaseDtoMapper<DeviceEntity, DeviceDto> {
  toDto(entity: DeviceEntity): DeviceDto {
    const props = entity.getProps();
    return {
      id: props.id,
      userId: props.userId,
      name: props.name,
      os: props.os,
      device: props.device,
      browser: props.browser,
      platform: props.platform,
      lastRefreshedAt: props.lastRefreshedAt.toISOString(),
      createdAt: props.createdAt.toISOString(),
    };
  }
}
