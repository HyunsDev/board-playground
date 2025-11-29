import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';

import { CreateUserProps, UserEntity } from '../../domain/user.entity';
import {
  UserEmailAlreadyExistsException,
  UserUsernameAlreadyExistsException,
} from '../../domain/user.exceptions';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../user.constant';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async create(
    props: CreateUserProps,
  ): Promise<
    Result<UserEntity, UserEmailAlreadyExistsException | UserUsernameAlreadyExistsException>
  > {
    const existingByEmail = await this.userRepo.findOneByEmail(props.email);
    if (!existingByEmail) return err(new UserEmailAlreadyExistsException());

    const existingByUsername = await this.userRepo.findOneByUsername(props.username);
    if (!existingByUsername) return err(new UserUsernameAlreadyExistsException());

    const user = UserEntity.create(props);
    await this.userRepo.insert(user);
    return ok(user);
  }
}
