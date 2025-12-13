import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BaseIQuery, BaseQuery } from '@workspace/backend-core';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { UserUsernameAlreadyExistsError } from '@/domains/user/domain/user.domain-errors';

type ICheckUsernameAvailableQuery = BaseIQuery<{
  username: string;
}>;

export class CheckUsernameAvailableQuery extends BaseQuery<
  ICheckUsernameAvailableQuery,
  HandlerResult<CheckUsernameAvailableQueryHandler>,
  void
> {
  readonly code = defineQueryCode('account:auth:qry:check_username_available');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(
    data: ICheckUsernameAvailableQuery['data'],
    metadata: ICheckUsernameAvailableQuery['metadata'],
  ) {
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
