import { Injectable } from '@nestjs/common';

import { Device } from '@workspace/db';

import { DeviceEntity, DeviceProps } from './domain/device.entity';

import { BaseMapper } from '@/shared/ddd';

@Injectable()
export class DeviceMapper extends BaseMapper<DeviceEntity, Device> {
  toDomain(record: Device): DeviceEntity {
    const props: DeviceProps = {
      userId: record.userId,
      hashedRefreshToken: record.hashedRefreshToken,
      name: record.name,
      userAgent: record.userAgent,
      os: record.os,
      device: record.device,
      browser: record.browser,
      platform: record.platform,
      ipAddress: record.ipAddress,
      lastRefreshedAt: record.lastRefreshedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return DeviceEntity.reconstruct(props, record.id);
  }

  toPersistence(entity: DeviceEntity): Device {
    const props = entity.getProps();
    return {
      id: props.id,
      userId: props.userId,
      hashedRefreshToken: props.hashedRefreshToken,
      name: props.name,
      userAgent: props.userAgent,
      os: props.os,
      device: props.device,
      browser: props.browser,
      platform: props.platform,
      ipAddress: props.ipAddress,
      lastRefreshedAt: props.lastRefreshedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
