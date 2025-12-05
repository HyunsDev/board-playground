import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.di-tokens';

import { BaseQuery, QueryProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type GetSessionQueryProps = QueryProps<{
  userId: string;
  sessionId: string;
}>;

export class GetSessionQuery extends BaseQuery<
  GetSessionQueryProps,
  HandlerResult<GetSessionQueryHandler>,
  SessionEntity
> {}

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute({ data }: GetSessionQueryProps) {
    return (await this.sessionRepo.getOneByIdAndUserId(data.sessionId, data.userId)).match(
      (session) => ok(session),
      (error) =>
        matchError(error, {
          SessionNotFound: (e) => err(e),
        }),
    );
  }
}
