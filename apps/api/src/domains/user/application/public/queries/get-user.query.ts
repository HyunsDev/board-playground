import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BaseQuery, BaseQueryProps, DeriveMetadata } from '@workspace/backend-core';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserNotFoundError } from '@/domains/user/domain/user.domain-errors';
import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';

type IGetUserMeQuery = BaseQueryProps<{
  userId: string;
}>;

export class GetUserQuery extends BaseQuery<
  IGetUserMeQuery,
  UserEntity,
  HandlerResult<GetUserQueryHandler>
> {
  static readonly code = defineQueryCode('account:user:qry:get');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: IGetUserMeQuery['data'], metadata: DeriveMetadata) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: IGetUserMeQuery) {
    const user = await this.userRepo.findOneById(data.userId);
    if (!user) return err(new UserNotFoundError());
    return ok(user);
  }
}
