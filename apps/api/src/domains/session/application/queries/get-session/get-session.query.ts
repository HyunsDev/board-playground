import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionRepositoryPort } from '../../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../../session.di-tokens';

import { QueryBase } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

export class GetSessionQuery extends QueryBase {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {
    super();
  }
}

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(query: GetSessionQuery) {
    return (await this.sessionRepo.getOneByIdWithUserId(query.sessionId, query.userId)).match(
      (session) => ok(session),
      (error) =>
        matchError(error, {
          SessionNotFound: (e) => err(e),
        }),
    );
  }
}

export type GetSessionQueryResult = HandlerResult<GetSessionQueryHandler>;
