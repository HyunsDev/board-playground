import { Module } from '@nestjs/common';

import { TokenService } from './token.service';
import { DeviceModule } from '../device/device.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [DeviceModule],
  providers: [TokenService, UserService],
  controllers: [],
  exports: [],
})
export class AuthModule {}
