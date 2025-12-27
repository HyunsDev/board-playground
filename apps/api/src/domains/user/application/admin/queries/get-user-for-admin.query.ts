import { HandlerResult } from '@workspace/backend-common';
import { BaseQuery, BaseQueryProps, IQueryHandler, QueryHandler } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { asQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserEntity } from '../../../domain/user.entity';
import { UserRepositoryPort } from '../../../domain/user.repository.port';

type IGetUserForAdminQuery = BaseQueryProps<{
  userId: UserId;
}>;
export class GetUserForAdminQuery extends BaseQuery<
  IGetUserForAdminQuery,
  UserEntity,
  HandlerResult<GetUserForAdminQueryHandler>
> {
  static readonly code = asQueryCode('account:user:qry:get_for_admin');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: IGetUserForAdminQuery['data']) {
    super(data.userId, data);
  }
}

@QueryHandler(GetUserForAdminQuery)
export class GetUserForAdminQueryHandler implements IQueryHandler<GetUserForAdminQuery> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: IGetUserForAdminQuery) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
