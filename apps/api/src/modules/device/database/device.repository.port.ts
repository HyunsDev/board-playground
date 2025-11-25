import { DeviceEntity } from '../domain/device.entity';

import { RepositoryPort } from '@/libs/ddd';

export interface DeviceRepositoryPort extends RepositoryPort<DeviceEntity> {
  findByUserIdAndHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string,
  ): Promise<DeviceEntity | null>;
}
