import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

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
export class GetUserMeQuery extends BaseQuery<
  IGetUserMeQuery,
  HandlerResult<GetUserMeQueryHandler>,
  UserEntity
> {
  readonly domain = DomainCodes.User;
  readonly code = QueryCodes.User.GetMe;
  readonly resourceType = DomainCodes.User;

  constructor(data: IGetUserMeQuery['data'], metadata: IGetUserMeQuery['metadata']) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserMeQuery)
export class GetUserMeQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: IGetUserMeQuery) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
