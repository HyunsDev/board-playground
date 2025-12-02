import { RefreshTokenEntity } from './refresh-token.entity';
import { InvalidRefreshTokenError } from './session.errors';

import { RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface RefreshTokenRepositoryPort extends RepositoryPort<RefreshTokenEntity> {
  getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): Promise<DomainResult<RefreshTokenEntity, InvalidRefreshTokenError>>;
}
