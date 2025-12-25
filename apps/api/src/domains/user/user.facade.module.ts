import { Module } from '@nestjs/common';

import { UserFacade } from './application';
import { UserApplicationModule } from './application/user-application.module';
import { UserMapper } from './infra/user.mapper';
import { UserDtoMapper } from './interface/user.dto-mapper';

@Module({
  imports: [UserApplicationModule],
  providers: [UserDtoMapper],
  controllers: [],
  exports: [UserDtoMapper, UserMapper, UserFacade],
})
export class UserFacadeModule {}
