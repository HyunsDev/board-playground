import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../../domain/user.entity';
import { UserRepositoryPort } from '../../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../../user.constants';

import { IQuery, BaseQuery } from '@/shared/base';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { QueryCodes } from '@/shared/codes/query.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type IGetUserForAdminQuery = IQuery<{
  userId: string;
}>;
export class GetUserForAdminQuery extends BaseQuery<
  IGetUserForAdminQuery,
  HandlerResult<GetUserForAdminQueryHandler>,
  UserEntity
> {
  readonly domain = DomainCodes.User;
  readonly code = QueryCodes.User.GetForAdmin;
  readonly resourceType = DomainCodes.User;

  constructor(data: IGetUserForAdminQuery['data'], metadata: IGetUserForAdminQuery['metadata']) {
    super(data.userId, data, metadata);
  }
}

@QueryHandler(GetUserForAdminQuery)
export class GetUserForAdminQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: IGetUserForAdminQuery) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
