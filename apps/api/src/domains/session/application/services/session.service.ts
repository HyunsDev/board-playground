import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { CreateSessionProps, SessionEntity } from '../../domain/session.entity';
import { SessionNotFoundError } from '../../domain/session.errors';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.di-tokens';

import {
  ConflictError,
  EntityConflictError,
  EntityNotFoundError,
  UnexpectedDomainErrorException,
} from '@/shared/base';
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

  async create(props: CreateSessionProps): Promise<DomainResult<SessionEntity, ConflictError>> {
    let session = SessionEntity.create(props);
    const res = await this.sessionRepo.save(session);
    if (res.isErr()) {
      return res;
    }
    session = res.value;
    return ok(session);
  }

  async updateLastUsedAt(id: string): Promise<DomainResult<SessionEntity, ConflictError>> {
    const sessionResult = await this.sessionRepo.getOneById(id);
    if (sessionResult.isErr()) {
      return sessionResult;
    }
    const session = sessionResult.value;

    session.updateLastUsedAt();
    return this.sessionRepo.save(session);
  }

  async revoke(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>> {
    const sessionResult = await this.sessionRepo.getOneById(id);
    if (sessionResult.isErr()) {
      return sessionResult;
    }
    const session = sessionResult.value;

    session.revoke();
    const saveRes = await this.sessionRepo.save(session);

    if (saveRes.isErr()) {
      if (saveRes.error instanceof EntityConflictError) {
        throw new UnexpectedDomainErrorException(saveRes.error);
      }

      if (saveRes.error instanceof EntityNotFoundError) {
        return err(new SessionNotFoundError());
      }

      throw new UnexpectedDomainErrorException(saveRes.error);
    }

    return ok(saveRes.value);
  }
}
