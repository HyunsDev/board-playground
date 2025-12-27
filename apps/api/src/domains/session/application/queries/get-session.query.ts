import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { IQueryHandler, QueryHandler } from '@workspace/backend-core';
import { BaseQueryProps, BaseQuery, DrivenMessageMetadata } from '@workspace/backend-core';
import { matchError } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { asQueryCode, DomainCodeEnums, SessionId } from '@workspace/domain';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';

type ISessionQuery = BaseQueryProps<{
  userId: UserId;
  sessionId: SessionId;
}>;

export class GetSessionQuery extends BaseQuery<
  ISessionQuery,
  SessionEntity,
  HandlerResult<GetSessionQueryHandler>
> {
  static readonly code = asQueryCode('account:session:qry:get');
  readonly resourceType = DomainCodeEnums.Account.Session;

  constructor(data: ISessionQuery['data'], metadata?: DrivenMessageMetadata) {
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
