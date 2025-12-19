import { QueryHandler } from '@nestjs/cqrs';

import { HandlerResult } from '@workspace/backend-common';
import { BaseQuery, BaseQueryProps, DrivenMessageMetadata } from '@workspace/backend-core';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserEntity } from '../../../domain/user.entity';
import { UserRepositoryPort } from '../../../domain/user.repository.port';

type IGetUserForAdminQuery = BaseQueryProps<{
  userId: string;
}>;
export class GetUserForAdminQuery extends BaseQuery<
  IGetUserForAdminQuery,
  UserEntity,
  HandlerResult<GetUserForAdminQueryHandler>
> {
  static readonly code = defineQueryCode('account:user:qry:get_for_admin');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: IGetUserForAdminQuery['data'], metadata: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserForAdminQuery)
export class GetUserForAdminQueryHandler {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: IGetUserForAdminQuery) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
