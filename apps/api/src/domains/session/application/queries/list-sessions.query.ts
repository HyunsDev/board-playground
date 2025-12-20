import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { IQueryHandler, QueryHandler } from '@workspace/backend-core';
import { BaseQuery, BaseQueryProps, DrivenMessageMetadata } from '@workspace/backend-core';
import { asQueryCode, DomainCodeEnums } from '@workspace/domain';

import { SessionEntity } from '../../domain/session.entity';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';

type ISessionsQuery = BaseQueryProps<{
  userId: string;
}>;

export class ListSessionsQuery extends BaseQuery<
  ISessionsQuery,
  SessionEntity[],
  HandlerResult<ListSessionsQueryHandler>
> {
  static readonly code = asQueryCode('account:session:qry:list');
  readonly resourceType = DomainCodeEnums.Account.Session;

  constructor(data: ISessionsQuery['data'], metadata: DrivenMessageMetadata) {
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
