import { HandlerResult } from '@workspace/backend-common';
import { IQueryHandler, QueryHandler } from '@workspace/backend-core';
import { BasePaginatedQueryProps, BaseQuery } from '@workspace/backend-core';
import { PaginatedResult } from '@workspace/common';
import { asQueryCode, DomainCodeEnums } from '@workspace/domain';

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
  static readonly code = asQueryCode('account:user:qry:search');
  readonly resourceType = DomainCodeEnums.Account.User;

  constructor(data: ISearchUserQuery['data']) {
    super(null, data);
  }
}

@QueryHandler(SearchUserQuery)
export class SearchUserQueryHandler implements IQueryHandler<SearchUserQuery> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: ISearchUserQuery) {
    return this.userRepo.searchUsers({
      nickname: data.nickname,
      page: data.page,
      limit: data.limit,
    });
  }
}
