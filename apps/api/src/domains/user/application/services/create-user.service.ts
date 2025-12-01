import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { CreateUserProps, UserEntity } from '../../domain/user.entity';
import {
  UserEmailAlreadyExistsError,
  UserUsernameAlreadyExistsError,
} from '../../domain/user.errors';
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
    const existingByEmail = await this.userRepo.findOneByEmail(props.email);
    if (!existingByEmail) return err(new UserEmailAlreadyExistsError());

    const existingByUsername = await this.userRepo.findOneByUsername(props.username);
    if (!existingByUsername) return err(new UserUsernameAlreadyExistsError());

    const user = UserEntity.create(props);
    await this.userRepo.save(user);
    return ok(user);
  }
}
