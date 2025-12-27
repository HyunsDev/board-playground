import { RepositoryPort, DomainResultAsync } from '@workspace/backend-ddd';

import { RefreshTokenEntity } from './refresh-token.entity';

export abstract class RefreshTokenRepositoryPort extends RepositoryPort<RefreshTokenEntity> {
  abstract createMany(tokens: RefreshTokenEntity[]): DomainResultAsync<RefreshTokenEntity[], never>;
  abstract updateMany(tokens: RefreshTokenEntity[]): DomainResultAsync<RefreshTokenEntity[], never>;
  abstract deleteMany(tokens: RefreshTokenEntity[]): DomainResultAsync<void, never>;
}
