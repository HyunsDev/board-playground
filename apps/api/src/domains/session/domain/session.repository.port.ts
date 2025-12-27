import { RepositoryPort, DomainResultAsync } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { SessionId } from '@workspace/domain';

import { SessionNotFoundError } from './session.domain-errors';
import { SessionEntity } from './session.entity';
import { InvalidRefreshTokenError } from './token.domain-errors';

export abstract class SessionRepositoryPort extends RepositoryPort<SessionEntity> {
  abstract getOneById(id: SessionId): DomainResultAsync<SessionEntity, SessionNotFoundError>;
  abstract getOneByIdAndUserId(
    id: SessionId,
    userId: UserId,
  ): DomainResultAsync<SessionEntity, SessionNotFoundError>;
  abstract listAllByUserId(userId: UserId): DomainResultAsync<SessionEntity[], never>;
  abstract listActiveByUserId(userId: UserId): DomainResultAsync<SessionEntity[], never>;
  abstract create(session: SessionEntity): DomainResultAsync<SessionEntity, never>;
  abstract update(session: SessionEntity): DomainResultAsync<SessionEntity, SessionNotFoundError>;
  abstract delete(session: SessionEntity): DomainResultAsync<void, SessionNotFoundError>;

  abstract getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): DomainResultAsync<SessionEntity, InvalidRefreshTokenError>;
}
