import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { UserUsernameAlreadyExistsError } from '@/domains/user/domain/user.domain-errors';
import { BaseQuery, CreateMessageMetadata, IQuery } from '@/shared/base';
import { QueryCodes } from '@/shared/codes/query.codes';
import { QueryResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type ICheckUsernameAvailableQuery = IQuery<{
  username: string;
}>;

export class CheckUsernameAvailableQuery extends BaseQuery<
  ICheckUsernameAvailableQuery,
  HandlerResult<CheckUsernameAvailableQueryHandler>,
  void
> {
  readonly code = QueryCodes.Auth.CheckUsernameAvailable;
  readonly resourceType = QueryResourceTypes.User;

  constructor(data: ICheckUsernameAvailableQuery['data'], metadata: CreateMessageMetadata) {
    super(null, data, metadata);
  }
}

@QueryHandler(CheckUsernameAvailableQuery)
export class CheckUsernameAvailableQueryHandler
  implements IQueryHandler<CheckUsernameAvailableQuery>
{
  constructor(private readonly userFacade: UserFacade) {}

  async execute({ data }: ICheckUsernameAvailableQuery) {
    const exists = await this.userFacade.usernameExists(data.username);
    if (exists) {
      return err(new UserUsernameAlreadyExistsError());
    }
    return ok(undefined);
  }
}
