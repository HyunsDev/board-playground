import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DeleteUserMeCommandHandler } from './application/commands/delete-user-me.command';
import { UpdateUserMeProfileCommandHandler } from './application/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommandHandler } from './application/commands/update-user-me-username.command';
import { UserActivityEventHandler } from './application/events/user-activity.event-handler';
import { GetUserForAdminQueryHandler } from './application/queries/get-user-for-admin.query';
import { GetUserMeQueryHandler } from './application/queries/get-user-me.query';
import { GetUserQueryHandler } from './application/queries/get-user.query';
import { SearchUserQueryHandler } from './application/queries/search-user.query';
import { UserFacade } from './application/facades/user.facade';
import { UserMapper } from './infra/user.mapper';
import { UserRepository } from './infra/user.repository';
import { UserAdminHttpController } from './interface/user-admin.http.controller';
import { UserMeHttpController } from './interface/user-me.http.controller';
import { UserDtoMapper } from './interface/user.dto-mapper';
import { UserHttpController } from './interface/user.http.controller';
import { USER_REPOSITORY } from './user.constant';

const httpControllers = [UserHttpController, UserMeHttpController, UserAdminHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [
  GetUserQueryHandler,
  GetUserMeQueryHandler,
  SearchUserQueryHandler,
  GetUserForAdminQueryHandler,
  UpdateUserMeProfileCommandHandler,
  UpdateUserMeUsernameCommandHandler,
  DeleteUserMeCommandHandler,
];
const eventHandlers: Provider[] = [UserActivityEventHandler];
const services: Provider[] = [UserFacade];
const mappers: Provider[] = [UserMapper, UserDtoMapper];
const repositories: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
];

@Module({
  imports: [CqrsModule],
  providers: [
    Logger,
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...services,
    ...mappers,
    ...repositories,
  ],
  controllers: [...httpControllers],
  exports: [UserFacade],
})
export class UserModule {}
