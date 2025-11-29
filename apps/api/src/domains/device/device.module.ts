import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DeviceRepository } from './database/deivce.repository';
import { DEVICE_REPOSITORY } from './device.di-tokens';
import { DeviceDtoMapper } from './device.dto-mapper';
import { DeviceMapper } from './device.mapper';
import { DeviceService } from './device.service';
import { GetDeviceHttpController } from './queries/get-device/get-device.http.controller';
import { GetDeviceQueryHandler } from './queries/get-device/get-device.query';
import { CreateDeviceService } from './services/create-device.service';

const httpControllers = [GetDeviceHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [GetDeviceQueryHandler];
const services: Provider[] = [CreateDeviceService];
const mappers: Provider[] = [DeviceMapper, DeviceDtoMapper];
const repositories: Provider[] = [
  {
    provide: DEVICE_REPOSITORY,
    useClass: DeviceRepository,
  },
];

@Module({
  imports: [CqrsModule],
  providers: [
    Logger,
    DeviceService,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    ...mappers,
    ...repositories,
  ],
  controllers: [...httpControllers],
  exports: [DEVICE_REPOSITORY, DeviceMapper, DeviceDtoMapper, CreateDeviceService],
})
export class DeviceModule {}
