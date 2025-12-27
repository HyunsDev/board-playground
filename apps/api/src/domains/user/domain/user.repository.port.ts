import { DomainResultAsync, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery, UserEmail, UserId, Username } from '@workspace/common';

import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from './user.domain-errors';
import { UserEntity } from '../domain/user.entity';

export type UserFindOneParams = {
  id?: UserId;
  email?: UserEmail;
  username?: Username;
};

export type UserExistsParams = {
  id?: UserId;
  email?: UserEmail;
  username?: Username;
};

export abstract class UserRepositoryPort extends RepositoryPort<UserEntity> {
  abstract findOne(params: UserFindOneParams): DomainResultAsync<UserEntity | null, never>;
  abstract getOne(params: UserFindOneParams): DomainResultAsync<UserEntity, UserNotFoundError>;
  abstract getOneById(userId: UserId): DomainResultAsync<UserEntity, UserNotFoundError>;
  abstract exists(params: UserExistsParams): DomainResultAsync<boolean, never>;
  abstract searchUsers(
    params: PaginationQuery<{ nickname?: string }>,
  ): DomainResultAsync<PaginatedResult<UserEntity>, never>;

  abstract create(
    user: UserEntity,
  ): DomainResultAsync<UserEntity, UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError>;
  abstract update(
    user: UserEntity,
  ): DomainResultAsync<
    UserEntity,
    UserNotFoundError | UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError
  >;
  abstract updateLastActiveAt(userId: UserId): DomainResultAsync<void, UserNotFoundError>;
  abstract delete(user: UserEntity): DomainResultAsync<void, UserNotFoundError>;
}
