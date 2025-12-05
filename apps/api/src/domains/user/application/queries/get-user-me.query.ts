import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { BaseQuery, QueryProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type GetUserMeQueryProps = QueryProps<{
  userId: string;
}>;
export class GetUserMeQuery extends BaseQuery<
  GetUserMeQueryProps,
  HandlerResult<GetUserMeQueryHandler>,
  UserEntity
> {}

@QueryHandler(GetUserMeQuery)
export class GetUserMeQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: GetUserMeQueryProps) {
    const result = await this.userRepo.getOneById(data.userId);
    return result;
  }
}
