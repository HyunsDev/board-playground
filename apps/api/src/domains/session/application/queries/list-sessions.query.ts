import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { SessionEntity } from '../../domain/session.entity';
import { SESSION_REPOSITORY } from '../../session.constants';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { BaseQuery, IQuery } from '@/shared/base';
import { QueryCodes } from '@/shared/codes/query.codes';
import { QueryResourceType, QueryResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type ISessionsQuery = IQuery<{
  userId: string;
}>;

export class ListSessionsQuery extends BaseQuery<
  ISessionsQuery,
  HandlerResult<ListSessionsQueryHandler>,
  SessionEntity[]
> {
  readonly code = QueryCodes.Session.List;
  readonly resourceType: QueryResourceType = QueryResourceTypes.User;

  constructor(data: ISessionsQuery['data'], metadata: ISessionsQuery['metadata']) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute({ data }: ISessionsQuery) {
    const sessions = await this.sessionRepo.listAllByUserId(data.userId);
    return ok(sessions);
  }
}
