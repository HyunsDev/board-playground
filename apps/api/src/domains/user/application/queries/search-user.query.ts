import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../user.constant';

import { BaseQuery, PaginatedQueryProps, PaginatedResult } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type SearchUserQueryProps = PaginatedQueryProps<{
  nickname?: string;
}>;

export class SearchUserQuery extends BaseQuery<
  SearchUserQueryProps,
  HandlerResult<SearchUserQueryHandler>,
  PaginatedResult<UserEntity>
> {}

@QueryHandler(SearchUserQuery)
export class SearchUserQueryHandler implements IQueryHandler<SearchUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: SearchUserQueryProps) {
    const { items, meta } = await this.userRepo.searchUsers({
      nickname: data.nickname,
      page: data.page,
      take: data.take,
    });

    return ok({ items, meta });
  }
}
