import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BasePaginatedQueryProps, BaseQuery, DeriveMetadata } from '@workspace/backend-core';
import { PaginatedResult } from '@workspace/common';
import { defineQueryCode, DomainCodeEnums } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';

type ISearchUserQuery = BasePaginatedQueryProps<{
  nickname?: string;
}>;

export class SearchUserQuery extends BaseQuery<
  ISearchUserQuery,
  PaginatedResult<UserEntity>,
  HandlerResult<SearchUserQueryHandler>
> {
  static readonly code = defineQueryCode('account:user:qry:search');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: ISearchUserQuery['data'], metadata: DeriveMetadata) {
    super(null, data, metadata);
  }
}

@QueryHandler(SearchUserQuery)
export class SearchUserQueryHandler implements IQueryHandler<SearchUserQuery> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: ISearchUserQuery) {
    const { items, meta } = await this.userRepo.searchUsers({
      nickname: data.nickname,
      page: data.page,
      take: data.limit,
    });

    return ok({ items, meta });
  }
}
