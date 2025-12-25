import { Module } from '@nestjs/common';

import { UserFacade } from './application';
import { UserApplicationModule } from './application/user-application.module';
import { UserInfraModule } from './infra/user-infra.module';
import { UserMapper } from './infra/user.mapper';
import { UserDtoMapper } from './interface/user.dto-mapper';

@Module({
  imports: [UserApplicationModule, UserInfraModule],
  providers: [UserDtoMapper, UserMapper, UserFacade],
  controllers: [],
  exports: [UserApplicationModule, UserInfraModule, UserDtoMapper, UserMapper, UserFacade],
})
export class UserFacadeModule {}
