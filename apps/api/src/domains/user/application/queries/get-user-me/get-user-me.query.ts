import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserNotFoundError } from '@/domains/user/domain/user.errors';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { QueryBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class GetUserMeQuery extends QueryBase<GetUserMeQueryResult> {
  constructor(public readonly userId: string) {
    super();
  }
}

export type GetUserMeQueryResult = DomainResult<UserEntity, UserNotFoundError>;

@QueryHandler(GetUserMeQuery)
export class GetUserMeQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(query: GetUserMeQuery): Promise<GetUserMeQueryResult> {
    const result = await this.userRepo.getById(query.userId);
    return result;
  }
}
