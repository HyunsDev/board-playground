import { SessionNotFoundError } from './session.domain-errors';
import { SessionEntity } from './session.entity';

import { RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface SessionRepositoryPort extends RepositoryPort<SessionEntity> {
  getOneById(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
  create(session: SessionEntity): Promise<DomainResult<SessionEntity, never>>;
  update(session: SessionEntity): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
  delete(session: SessionEntity): Promise<DomainResult<void, SessionNotFoundError>>;
}
