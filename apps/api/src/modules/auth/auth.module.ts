import { Module } from '@nestjs/common';

import { TokenService } from './token.service';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [DeviceModule],
  providers: [TokenService],
  controllers: [],
  exports: [],
})
export class AuthModule {}
