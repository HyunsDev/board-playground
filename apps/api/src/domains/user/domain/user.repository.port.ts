import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from './user.domain-errors';
import { UserEntity } from '../domain/user.entity';

import { PaginatedResult, RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  getOneById(id: string): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  getOneByEmail(email: string): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneByUsername(username: string): Promise<UserEntity | null>;
  usernameExists(username: string): Promise<boolean>;
  searchUsers(params: {
    nickname?: string;
    page: number;
    take: number;
  }): Promise<PaginatedResult<UserEntity>>;
  count(): Promise<number>;
  create(
    user: UserEntity,
  ): Promise<
    DomainResult<UserEntity, UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError>
  >;

  update(
    user: UserEntity,
  ): Promise<
    DomainResult<
      UserEntity,
      UserNotFoundError | UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError
    >
  >;
  delete(user: UserEntity): Promise<DomainResult<void, UserNotFoundError>>;
}
