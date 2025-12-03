import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from './user.errors';
import { UserEntity } from '../domain/user.entity';

import { EntityConflictError, EntityNotFoundError, RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  getById(id: string): Promise<DomainResult<UserEntity, UserNotFoundError>>;
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneByUsername(username: string): Promise<UserEntity | null>;
  count(): Promise<number>;

  /**
   * @deprecated Use {@link create} or {@link update} instead.
   */
  save(
    entity: UserEntity,
  ): Promise<DomainResult<UserEntity, EntityConflictError | EntityNotFoundError>>;

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
}
