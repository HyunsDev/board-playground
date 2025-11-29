import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserNotFoundException } from '@/domains/user/domain/user.exceptions';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { QueryBase } from '@/shared/ddd';

export class GetUserQuery extends QueryBase<GetUserQueryResult> {
  constructor(public readonly userId: string) {
    super();
  }
}
export type GetUserQueryResult = Result<UserEntity, UserNotFoundException>;

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, GetUserQueryResult> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserQueryResult> {
    const user = await this.userRepo.findOneById(query.userId);
    if (!user) return err(new UserNotFoundException());
    return ok(user);
  }
}
