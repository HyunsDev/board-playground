import { Inject, Injectable } from '@nestjs/common';
import { err } from 'neverthrow';

import { SessionNotFoundError } from '../../domain/session.domain-errors';
import { CreateSessionProps, SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.di-tokens';

import { DomainResult } from '@/shared/types/result.type';

@Injectable()
export class SessionService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async getOneById(id: string) {
    return this.sessionRepo.getOneById(id);
  }

  async create(props: CreateSessionProps) {
    const session = SessionEntity.create(props);
    const result = await this.sessionRepo.create(session);
    return result;
  }

  async updateLastUsedAt(id: string) {
    const sessionResult = await this.sessionRepo.getOneById(id);
    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }
    const session = sessionResult.value;

    session.updateLastUsedAt();
    const result = await this.sessionRepo.update(session);
    return result;
  }

  async revoke(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>> {
    const sessionResult = await this.sessionRepo.getOneById(id);
    if (sessionResult.isErr()) return sessionResult;
    const session = sessionResult.value;

    session.revoke();
    const result = await this.sessionRepo.update(session);
    return result;
  }
}
