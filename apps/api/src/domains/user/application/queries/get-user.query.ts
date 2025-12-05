import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserNotFoundError } from '@/domains/user/domain/user.domain-errors';
import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { BaseQuery, QueryProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type GetUserMeQueryProps = QueryProps<{
  userId: string;
}>;

export class GetUserQuery extends BaseQuery<
  GetUserMeQueryProps,
  HandlerResult<GetUserQueryHandler>,
  UserEntity
> {}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: GetUserMeQueryProps) {
    const user = await this.userRepo.findOneById(data.userId);
    if (!user) return err(new UserNotFoundError());
    return ok(user);
  }
}
