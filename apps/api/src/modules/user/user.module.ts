import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UserRepository } from './database/user.repository';
import { GetUserHttpController } from './queries/get-user/get-user.http.controller';
import { GetUserQueryHandler } from './queries/get-user/get-user.query';
import { USER_REPOSITORY } from './user.di-tokens';
import { UserDtoMapper } from './user.dto-mapper';
import { UserMapper } from './user.mapper';

const httpControllers = [GetUserHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [GetUserQueryHandler];
const mappers: Provider[] = [UserMapper, UserDtoMapper];
const repositories: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
];

@Module({
  imports: [CqrsModule],
  providers: [Logger, ...commandHandlers, ...queryHandlers, ...mappers, ...repositories],
  controllers: [...httpControllers],
  exports: [UserRepository, UserMapper, UserDtoMapper],
})
export class UserModule {}
