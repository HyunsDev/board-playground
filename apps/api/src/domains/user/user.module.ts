import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetUserMeQueryHandler } from './application/queries/get-user-me.query';
import { GetUserQueryHandler } from './application/queries/get-user.query';
import { SearchUserQueryHandler } from './application/queries/search-user.query';
import { CreateUserService } from './application/services/create-user.service';
import { UserMapper } from './infra/user.mapper';
import { UserRepository } from './infra/user.repository';
import { UserMeHttpController } from './interface/user-me.http.controller';
import { UserDtoMapper } from './interface/user.dto-mapper';
import { UserFacade } from './interface/user.facade';
import { UserHttpController } from './interface/user.http.controller';
import { USER_REPOSITORY } from './user.constant';

const httpControllers = [UserHttpController, UserMeHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [
  GetUserQueryHandler,
  GetUserMeQueryHandler,
  SearchUserQueryHandler,
];
const services: Provider[] = [CreateUserService];
const mappers: Provider[] = [UserMapper, UserDtoMapper];
const repositories: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
];
const facades: Provider[] = [UserFacade];

@Module({
  imports: [CqrsModule],
  providers: [
    Logger,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    ...mappers,
    ...repositories,
    ...facades,
  ],
  controllers: [...httpControllers],
  exports: [UserFacade],
})
export class UserModule {}
