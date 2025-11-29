import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetUserHttpController } from './application/queries/get-user/get-user.http.controller';
import { GetUserQueryHandler } from './application/queries/get-user/get-user.query';
import { CreateUserService } from './application/services/create-user.service';
import { UserMapper } from './infra/user.mapper';
import { UserRepository } from './infra/user.repository';
import { UserDtoMapper } from './interface/user.dto-mapper';
import { UserFacade } from './interface/user.facade';
import { USER_REPOSITORY } from './user.constant';

const httpControllers = [GetUserHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [GetUserQueryHandler];
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
