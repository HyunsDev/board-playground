import { Injectable, Logger } from '@nestjs/common';

import { Device, PrismaClient } from '@workspace/db';

import { DeviceRepositoryPort } from './device.repository.port';
import { DeviceMapper } from '../device.mapper';
import { DeviceEntity } from '../domain/device.entity';

import { BaseRepository } from '@/libs/db/base.repository';
import { DomainEventDispatcher } from '@/modules/prisma/domain-event.dispatcher';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class DeviceRepository
  extends BaseRepository<DeviceEntity, Device>
  implements DeviceRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: DeviceMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, mapper, eventDispatcher, new Logger(DeviceRepository.name));
  }

  protected get delegate() {
    return (this.prisma as PrismaClient).device;
  }

  async findByUserIdAndHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    const record = await this.delegate.findFirst({
      where: { userId, hashedRefreshToken },
    });
    if (!record) {
      return null;
    }
    return this.mapper.toDomain(record);
  }
}
