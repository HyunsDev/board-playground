import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../user.constant';

import { BaseQuery, PaginatedQueryProps, PaginatedResult } from '@/shared/base';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { QueryCodes } from '@/shared/codes/query.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type ISearchUserQuery = PaginatedQueryProps<{
  nickname?: string;
}>;

export class SearchUserQuery extends BaseQuery<
  ISearchUserQuery,
  HandlerResult<SearchUserQueryHandler>,
  PaginatedResult<UserEntity>
> {
  readonly domain = DomainCodes.User;
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
