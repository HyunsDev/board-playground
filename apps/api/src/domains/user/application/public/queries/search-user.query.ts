import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constants';
import { BaseQuery, PaginatedQueryProps, PaginatedResult } from '@/shared/base';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { QueryCodes } from '@/shared/codes/query.codes';

type ISearchUserQuery = PaginatedQueryProps<{
  nickname?: string;
}>;

export class SearchUserQuery extends BaseQuery<
  ISearchUserQuery,
  HandlerResult<SearchUserQueryHandler>,
  PaginatedResult<UserEntity>
> {
  readonly code = QueryCodes.User.Search;
  readonly resourceType = DomainCodes.User;

  constructor(data: ISearchUserQuery['data'], metadata: ISearchUserQuery['metadata']) {
    super(null, data, metadata);
  }
}

@QueryHandler(SearchUserQuery)
export class SearchUserQueryHandler implements IQueryHandler<SearchUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: ISearchUserQuery) {
    const { items, meta } = await this.userRepo.searchUsers({
      nickname: data.nickname,
      page: data.page,
      take: data.take,
    });

    return ok({ items, meta });
  }
}
