import { Module, Provider } from '@nestjs/common';

import { UserRepositoryPort } from '../domain/user.repository.port';
import { UserMapper } from '../infra/user.mapper';
import { UserRepository } from '../infra/user.repository';

const repositories: Provider[] = [{ provide: UserRepositoryPort, useClass: UserRepository }];

const mappers: Provider[] = [UserMapper];

@Module({
  providers: [...repositories, ...mappers],
  exports: [UserRepositoryPort],
})
export class UserInfraModule {}
