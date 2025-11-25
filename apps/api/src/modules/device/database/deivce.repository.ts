import { Injectable } from '@nestjs/common';

import { Device, PrismaClient } from '@workspace/db';

import { DeviceRepositoryPort } from './device.repository.port';
import { DeviceMapper } from '../device.mapper';
import { DeviceEntity } from '../domain/device.entity';

import { BaseRepository } from '@/libs/db/base.repository';
import { DomainEventDispatcher } from '@/libs/db/domain-event.dispatcher';
import { LoggerPort } from '@/libs/ports/logger.port';
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
    protected readonly logger: LoggerPort,
  ) {
    super(prisma, mapper, eventDispatcher, logger);
  }

  protected get delegate() {
    return (this.prisma as PrismaClient).device;
  }

  async findOneByDeviceIdentifier(deviceIdentifier: string): Promise<DeviceEntity | null> {
    const record = await this.delegate.findUnique({
      where: { deviceIdentifier },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
