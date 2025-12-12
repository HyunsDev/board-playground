import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { SessionEntity } from '../../domain/session.entity';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { BaseQuery, BaseIQuery } from '@/shared/base';

type ISessionsQuery = BaseIQuery<{
  userId: string;
}>;

export class ListSessionsQuery extends BaseQuery<
  ISessionsQuery,
  HandlerResult<ListSessionsQueryHandler>,
  SessionEntity[]
> {
  readonly code = defineQueryCode('account:session:qry:list');
  readonly resourceType = DomainCodeEnums.Account.Session;

  constructor(data: ISessionsQuery['data'], metadata: ISessionsQuery['metadata']) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(private readonly sessionRepo: SessionRepositoryPort) {}

  async execute({ data }: ISessionsQuery) {
    const sessions = await this.sessionRepo.listAllByUserId(data.userId);
    return ok(sessions);
  }
}
