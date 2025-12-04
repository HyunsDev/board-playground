import { RefreshTokenEntity } from './refresh-token.entity';
import { InvalidRefreshTokenError, RefreshTokenNotFoundError } from './session.domain-errors';

import { RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface RefreshTokenRepositoryPort extends RepositoryPort<RefreshTokenEntity> {
  getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): Promise<DomainResult<RefreshTokenEntity, InvalidRefreshTokenError>>;

  create(refreshToken: RefreshTokenEntity): Promise<DomainResult<RefreshTokenEntity, never>>;
  update(
    refreshToken: RefreshTokenEntity,
  ): Promise<DomainResult<RefreshTokenEntity, RefreshTokenNotFoundError>>;
  delete(refreshToken: RefreshTokenEntity): Promise<DomainResult<void, RefreshTokenNotFoundError>>;
}
