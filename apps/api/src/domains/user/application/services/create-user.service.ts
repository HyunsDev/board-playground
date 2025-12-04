import { Inject, Injectable } from '@nestjs/common';

import {
  UserEmailAlreadyExistsError,
  UserUsernameAlreadyExistsError,
} from '../../domain/user.domain-errors';
import { CreateUserProps, UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../user.constant';

import { DomainResult } from '@/shared/types/result.type';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async create(
    props: CreateUserProps,
  ): Promise<
    DomainResult<UserEntity, UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError>
  > {
    const user = UserEntity.create(props);
    const created = await this.userRepo.create(user);
    return created;
  }
}
