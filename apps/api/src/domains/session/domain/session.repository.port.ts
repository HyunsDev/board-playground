import { RepositoryPort, DomainResult } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { SessionId } from '@workspace/domain';

import { SessionNotFoundError } from './session.domain-errors';
import { SessionEntity } from './session.entity';
import { InvalidRefreshTokenError } from './token.domain-errors';

export abstract class SessionRepositoryPort extends RepositoryPort<SessionEntity> {
  abstract getOneById(id: SessionId): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
  abstract getOneByIdAndUserId(
    id: SessionId,
    userId: UserId,
  ): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
  abstract listAllByUserId(userId: UserId): Promise<SessionEntity[]>;
  abstract listActiveByUserId(userId: UserId): Promise<SessionEntity[]>;
  abstract create(session: SessionEntity): Promise<DomainResult<SessionEntity, never>>;
  abstract update(
    session: SessionEntity,
  ): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
  abstract delete(session: SessionEntity): Promise<DomainResult<void, SessionNotFoundError>>;

  abstract getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): Promise<DomainResult<SessionEntity, InvalidRefreshTokenError>>;
}
