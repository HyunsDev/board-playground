import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserNotFoundError } from '@/domains/user/domain/user.domain-errors';
import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { QueryBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class GetUserQuery extends QueryBase<GetUserQueryResult> {
  constructor(public readonly userId: string) {
    super();
  }
}
export type GetUserQueryResult = DomainResult<UserEntity, UserNotFoundError>;

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, GetUserQueryResult> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserQueryResult> {
    const user = await this.userRepo.findOneById(query.userId);
    if (!user) return err(new UserNotFoundError());
    return ok(user);
  }
}
