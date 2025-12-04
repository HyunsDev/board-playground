import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionNotFoundError } from '../../../domain/session.domain-errors';
import { SessionEntity } from '../../../domain/session.entity';
import { SessionRepositoryPort } from '../../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../../session.di-tokens';

import { QueryBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class GetSessionQuery extends QueryBase<GetSessionQueryResult> {
  constructor(public readonly deviceId: string) {
    super();
  }
}
export type GetSessionQueryResult = DomainResult<SessionEntity, SessionNotFoundError>;

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler
  implements IQueryHandler<GetSessionQuery, GetSessionQueryResult>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(query: GetSessionQuery): Promise<GetSessionQueryResult> {
    const session = await this.sessionRepo.findOneById(query.deviceId);
    if (!session) return err(new SessionNotFoundError());
    return ok(session);
  }
}
