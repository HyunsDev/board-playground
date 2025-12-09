import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserNotFoundError } from '@/domains/user/domain/user.domain-errors';
import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constants';
import { BaseQuery, IQuery } from '@/shared/base';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { QueryCodes } from '@/shared/codes/query.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type IGetUserMeQuery = IQuery<{
  userId: string;
}>;

export class GetUserQuery extends BaseQuery<
  IGetUserMeQuery,
  HandlerResult<GetUserQueryHandler>,
  UserEntity
> {
  readonly domain = DomainCodes.User;
  readonly code = QueryCodes.User.Get;
  readonly resourceType = DomainCodes.User;

  constructor(data: IGetUserMeQuery['data'], metadata: IGetUserMeQuery['metadata']) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: IGetUserMeQuery) {
    const user = await this.userRepo.findOneById(data.userId);
    if (!user) return err(new UserNotFoundError());
    return ok(user);
  }
}
