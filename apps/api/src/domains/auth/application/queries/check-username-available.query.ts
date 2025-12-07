import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserService } from '@/domains/user/application/services/user.service';
import { UserUsernameAlreadyExistsError } from '@/domains/user/domain/user.domain-errors';
import { BaseQuery, CreateMessageMetadata, IQuery } from '@/shared/base';
import { DomainCodes } from '@/shared/codes/domain.codes';
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
  readonly domain = DomainCodes.User;
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
  constructor(private readonly userService: UserService) {}

  async execute({ data }: ICheckUsernameAvailableQuery) {
    const exists = await this.userService.usernameExists(data.username);
    if (exists) {
      return err(new UserUsernameAlreadyExistsError());
    }
    return ok(undefined);
  }
}
