import { DeviceEntity } from '../domain/device.entity';

import { RepositoryPort } from '@/shared/base';

export interface DeviceRepositoryPort extends RepositoryPort<DeviceEntity> {
  findByHashedRefreshToken(hashedRefreshToken: string): Promise<DeviceEntity | null>;
}
