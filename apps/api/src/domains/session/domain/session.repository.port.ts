import { SessionEntity } from './session.entity';
import { SessionNotFoundError } from './session.errors';

import { RepositoryPort } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export interface SessionRepositoryPort extends RepositoryPort<SessionEntity> {
  getOneById(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>>;
}
