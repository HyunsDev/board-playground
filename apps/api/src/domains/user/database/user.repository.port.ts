import { UserEntity } from '../domain/user.entity';

import { RepositoryPort } from '@/shared/ddd';

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneByUsername(username: string): Promise<UserEntity | null>;
}
