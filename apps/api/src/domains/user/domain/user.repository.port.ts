import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult } from '@workspace/common';

import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from './user.domain-errors';
import { UserEntity } from '../domain/user.entity';

export abstract class UserRepositoryPort extends RepositoryPort<UserEntity> {
  abstract getOneById(id: string): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract getOneByEmail(email: string): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract findOneByEmail(email: string): Promise<UserEntity | null>;
  abstract findOneByUsername(username: string): Promise<UserEntity | null>;
  abstract usernameExists(username: string): Promise<boolean>;
  abstract userEmailExists(email: string): Promise<boolean>;
  abstract searchUsers(params: {
    nickname?: string;
    page: number;
    take: number;
  }): Promise<PaginatedResult<UserEntity>>;
  abstract count(): Promise<number>;
  abstract create(
    user: UserEntity,
  ): Promise<
    DomainResult<UserEntity, UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError>
  >;
  abstract update(
    user: UserEntity,
  ): Promise<
    DomainResult<
      UserEntity,
      UserNotFoundError | UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError
    >
  >;
  abstract updateLastActiveAt(userId: string): Promise<DomainResult<void, UserNotFoundError>>;
  abstract delete(user: UserEntity): Promise<DomainResult<void, UserNotFoundError>>;
}
