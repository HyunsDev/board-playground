import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
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
  abstract findOne(params: UserFindOneParams): Promise<UserEntity | null>;
  abstract getOne(params: UserFindOneParams): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract getOneById(userId: UserId): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  abstract exists(params: UserExistsParams): Promise<boolean>;
  abstract searchUsers(
    params: PaginationQuery<{ nickname?: string }>,
  ): Promise<PaginatedResult<UserEntity>>;

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
