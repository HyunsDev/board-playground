import { DeviceEntity } from '../domain/device.entity';

import { RepositoryPort } from '@/libs/ddd';

export interface DeviceRepositoryPort extends RepositoryPort<DeviceEntity> {
  findByHashedRefreshToken(hashedRefreshToken: string): Promise<DeviceEntity | null>;
}
