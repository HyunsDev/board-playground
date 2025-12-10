import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.constants';

import { BaseQuery, IQuery } from '@/shared/base';
import { QueryCodes } from '@/shared/codes/query.codes';
import { QueryResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type ISessionQuery = IQuery<{
  userId: string;
  sessionId: string;
}>;

export class GetSessionQuery extends BaseQuery<
  ISessionQuery,
  HandlerResult<GetSessionQueryHandler>,
  SessionEntity
> {
  readonly code = QueryCodes.Session.Get;
  readonly resourceType = QueryResourceTypes.Session;

  constructor(data: ISessionQuery['data'], metadata: ISessionQuery['metadata']) {
    super(data.sessionId, data, metadata);
  }
}

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute({ data }: ISessionQuery) {
    return (await this.sessionRepo.getOneByIdAndUserId(data.sessionId, data.userId)).match(
      (session) => ok(session),
      (error) =>
        matchError(error, {
          SessionNotFound: (e) => err(e),
        }),
    );
  }
}
