import { QueryHandler } from '@nestjs/cqrs';

import { HandlerResult } from '@workspace/backend-common';
import { BaseQuery, BaseQueryProps, DeriveMetadata } from '@workspace/backend-core';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';

type IGetUserMeQuery = BaseQueryProps<{
  userId: string;
}>;
export class GetUserMeQuery extends BaseQuery<
  IGetUserMeQuery,
  UserEntity,
  HandlerResult<GetUserMeQueryHandler>
> {
  static readonly code = defineQueryCode('account:user:qry:get_me');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: IGetUserMeQuery['data'], metadata: DeriveMetadata) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserMeQuery)
export class GetUserMeQueryHandler {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: IGetUserMeQuery) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
