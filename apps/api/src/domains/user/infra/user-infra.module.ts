import { Module, Provider } from '@nestjs/common';

import { UserMapper } from '../infra/user.mapper';
import { UserRepository } from '../infra/user.repository';
import { USER_REPOSITORY } from '../user.constants';

const repositories: Provider[] = [{ provide: USER_REPOSITORY, useClass: UserRepository }];

const mappers: Provider[] = [UserMapper];

@Module({
  providers: [...repositories, ...mappers],
  exports: [USER_REPOSITORY],
})
export class UserInfraModule {}
