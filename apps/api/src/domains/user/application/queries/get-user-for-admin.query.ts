import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';
import { USER_REPOSITORY } from '../../user.constant';

import { QueryProps, BaseQuery } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type GetUserForAdminQueryProps = QueryProps<{
  userId: string;
}>;
export class GetUserForAdminQuery extends BaseQuery<
  GetUserForAdminQueryProps,
  HandlerResult<GetUserForAdminQueryHandler>,
  UserEntity
> {}

@QueryHandler(GetUserForAdminQuery)
export class GetUserForAdminQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: GetUserForAdminQueryProps) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
