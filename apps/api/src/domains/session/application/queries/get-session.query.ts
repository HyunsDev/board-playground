import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { matchError } from '@workspace/backend-ddd';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';

import { BaseIQuery, BaseQuery } from '@/shared/base';

type ISessionQuery = BaseIQuery<{
  userId: string;
  sessionId: string;
}>;

export class GetSessionQuery extends BaseQuery<
  ISessionQuery,
  HandlerResult<GetSessionQueryHandler>,
  SessionEntity
> {
  readonly code = defineQueryCode('account:session:qry:get');
  readonly resourceType = DomainCodeEnums.Account.Session;

  constructor(data: ISessionQuery['data'], metadata: ISessionQuery['metadata']) {
    super(data.sessionId, data, metadata);
  }
}

@QueryHandler(GetSessionQuery)
export class GetSessionQueryHandler implements IQueryHandler<GetSessionQuery> {
  constructor(private readonly sessionRepo: SessionRepositoryPort) {}

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
