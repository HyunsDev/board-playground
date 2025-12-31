import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { UserEmail, UserId, Username } from '@workspace/domain';

import { CreateUserProps, UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';

@Injectable()
export class UserFacade {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async create(props: CreateUserProps) {
    const user = UserEntity.create(props);
    const created = await this.userRepo.create(user);
    return created;
  }

  async findOneById(id: UserId) {
    return await this.userRepo.findOneById(id);
  }

  async getOneById(id: UserId) {
    return await this.userRepo.getOneById(id);
  }

  async getOneByEmail(email: UserEmail) {
    return await this.userRepo.getOne({ email });
  }

  async usernameExists(username: Username) {
    return await this.userRepo.exists({ username });
  }

  async userEmailExists(email: UserEmail) {
    return await this.userRepo.exists({ email });
  }

  async updatePassword(userId: UserId, newHashedPassword: string) {
    const userResult = await this.userRepo.getOneById(userId);
    if (userResult.isErr()) return userResult;

    const user = userResult.value;
    user.changePassword(newHashedPassword);
    const result = await this.userRepo.update(user);
    if (result.isErr())
      return matchError(result.error, {
        UserNotFound: (e) => err(e),
        UserEmailAlreadyExists: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
        UserUsernameAlreadyExists: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      });
    return ok(result.value);
  }
}
