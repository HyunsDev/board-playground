import { DeviceEntity } from '../domain/device.entity';

import { RepositoryPort } from '@/libs/ddd';

export interface DeviceRepositoryPort extends RepositoryPort<DeviceEntity> {
  findOneByDeviceIdentifier(deviceIdentifier: string): Promise<DeviceEntity | null>;
}
