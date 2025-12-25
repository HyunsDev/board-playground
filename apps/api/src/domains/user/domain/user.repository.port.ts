import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery, UserEmail, UserId, Username } from '@workspace/common';

import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from './user.domain-errors';
import { UserEntity } from '../domain/user.entity';

export abstract class UserRepositoryPort extends RepositoryPort<UserEntity> {
  abstract getOneById(id: UserId): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract getOneByEmail(email: UserEmail): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract findOneByEmail(email: UserEmail): Promise<UserEntity | null>;
  abstract findOneByUsername(username: Username): Promise<UserEntity | null>;
  abstract usernameExists(username: Username): Promise<boolean>;
  abstract userEmailExists(email: UserEmail): Promise<boolean>;
  abstract searchUsers(
    params: PaginationQuery<{ nickname?: string }>,
  ): Promise<PaginatedResult<UserEntity>>;
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
  abstract updateLastActiveAt(userId: UserId): Promise<DomainResult<void, UserNotFoundError>>;
  abstract delete(user: UserEntity): Promise<DomainResult<void, UserNotFoundError>>;
}
