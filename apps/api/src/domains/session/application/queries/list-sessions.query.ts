import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { SESSION_REPOSITORY } from '@/domains/session/session.di-tokens';
import { QueryBase } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

export class ListSessionsQuery extends QueryBase {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(query: ListSessionsQuery) {
    const sessions = await this.sessionRepo.listAllByUserId(query.userId);
    return ok(sessions);
  }
}

export type ListSessionsQueryResult = HandlerResult<ListSessionsQueryHandler>;
