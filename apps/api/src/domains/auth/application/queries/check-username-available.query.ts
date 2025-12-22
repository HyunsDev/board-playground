import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { IQueryHandler, QueryHandler } from '@workspace/backend-core';
import { BaseQueryProps, BaseQuery, DrivenMessageMetadata } from '@workspace/backend-core';
import { asQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { UserUsernameAlreadyExistsError } from '@/domains/user/domain/user.domain-errors';

type ICheckUsernameAvailableQuery = BaseQueryProps<{
  username: string;
}>;

export class CheckUsernameAvailableQuery extends BaseQuery<
  ICheckUsernameAvailableQuery,
  void,
  HandlerResult<CheckUsernameAvailableQueryHandler>
> {
  static readonly code = asQueryCode('account:auth:qry:check_username_available');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: ICheckUsernameAvailableQuery['data'], metadata?: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@QueryHandler(CheckUsernameAvailableQuery)
export class CheckUsernameAvailableQueryHandler implements IQueryHandler<CheckUsernameAvailableQuery> {
  constructor(private readonly userFacade: UserFacade) {}

  async execute({ data }: ICheckUsernameAvailableQuery) {
    const exists = await this.userFacade.usernameExists(data.username);
    if (exists) {
      return err(new UserUsernameAlreadyExistsError());
    }
    return ok(undefined);
  }
}
