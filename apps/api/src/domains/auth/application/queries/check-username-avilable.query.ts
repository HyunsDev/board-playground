import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserService } from '@/domains/user/application/services/user.service';
import { UserUsernameAlreadyExistsError } from '@/domains/user/domain/user.domain-errors';
import { BaseQuery, QueryProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type CheckUsernameAvailableQueryProps = QueryProps<{
  username: string;
}>;

export class CheckUsernameAvailableQuery extends BaseQuery<
  CheckUsernameAvailableQueryProps,
  HandlerResult<CheckUsernameAvailableQueryHandler>,
  void
> {}

@QueryHandler(CheckUsernameAvailableQuery)
export class CheckUsernameAvailableQueryHandler
  implements IQueryHandler<CheckUsernameAvailableQuery>
{
  constructor(private readonly userService: UserService) {}

  async execute({ data }: CheckUsernameAvailableQueryProps) {
    const exists = await this.userService.usernameExists(data.username);
    if (exists) {
      return err(new UserUsernameAlreadyExistsError());
    }
    return ok(undefined);
  }
}
