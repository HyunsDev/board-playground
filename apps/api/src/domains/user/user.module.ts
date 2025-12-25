import { Module } from '@nestjs/common';

import { UserApplicationModule } from './application/user-application.module';
import { UserMapper } from './infra/user.mapper';
import { UserAdminHttpController } from './interface/user-admin.http.controller';
import { UserMeHttpController } from './interface/user-me.http.controller';
import { UserDtoMapper } from './interface/user.dto-mapper';
import { UserHttpController } from './interface/user.http.controller';

@Module({
  imports: [UserApplicationModule],
  providers: [UserDtoMapper],
  controllers: [UserHttpController, UserMeHttpController, UserAdminHttpController],
  exports: [UserApplicationModule, UserMapper, UserDtoMapper],
})
export class UserModule {}
