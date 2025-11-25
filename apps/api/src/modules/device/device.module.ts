import { Module } from '@nestjs/common';

import { DeviceService } from './device.service';

@Module({
  imports: [],
  providers: [DeviceService],
  controllers: [],
  exports: [DeviceService],
})
export class DeviceModule {}
