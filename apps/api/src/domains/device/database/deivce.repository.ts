import { Injectable, Logger } from '@nestjs/common';

import { Device, PrismaClient } from '@workspace/db';

import { DeviceRepositoryPort } from './device.repository.port';
import { DeviceMapper } from '../device.mapper';
import { DeviceEntity } from '../domain/device.entity';

import { ContextService } from '@/infra/context/context.service';
import { DomainEventDispatcher } from '@/infra/prisma/domain-event.dispatcher';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { BaseRepository } from '@/shared/ddd/base.repository';

@Injectable()
export class DeviceRepository
  extends BaseRepository<DeviceEntity, Device>
  implements DeviceRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly context: ContextService,
    protected readonly mapper: DeviceMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, context, mapper, eventDispatcher, new Logger(DeviceRepository.name));
  }

  protected get delegate() {
    return (this.prisma as PrismaClient).device;
  }

  async findByHashedRefreshToken(hashedRefreshToken: string) {
    const record = await this.delegate.findFirst({
      where: { hashedRefreshToken },
    });
    if (!record) {
      return null;
    }
    return this.mapper.toDomain(record);
  }
}
