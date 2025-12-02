import { Injectable, Logger } from '@nestjs/common';

import { Device, PrismaClient } from '@workspace/db';

import { DeviceRepositoryPort } from './device.repository.port';
import { DeviceMapper } from '../device.mapper';
import { DeviceEntity } from '../domain/device.entity';

import { ContextService } from '@/infra/context/context.service';
import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { BaseRepository } from '@/shared/base/infra/base.repository';

@Injectable()
export class DeviceRepository
  extends BaseRepository<DeviceEntity, Device>
  implements DeviceRepositoryPort
{
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly context: ContextService,
    protected readonly mapper: DeviceMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, context, mapper, eventDispatcher, new Logger(DeviceRepository.name));
  }

  protected get delegate(): PrismaClient['device'] {
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
