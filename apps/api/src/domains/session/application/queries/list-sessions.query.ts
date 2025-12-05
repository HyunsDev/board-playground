import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { SessionEntity } from '../../domain/session.entity';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { SESSION_REPOSITORY } from '@/domains/session/session.di-tokens';
import { BaseQuery, QueryProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type ListSessionsQueryProps = QueryProps<{
  userId: string;
}>;

export class ListSessionsQuery extends BaseQuery<
  ListSessionsQueryProps,
  HandlerResult<ListSessionsQueryHandler>,
  SessionEntity[]
> {}

@QueryHandler(ListSessionsQuery)
export class ListSessionsQueryHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute({ data }: ListSessionsQueryProps) {
    const sessions = await this.sessionRepo.listAllByUserId(data.userId);
    return ok(sessions);
  }
}
