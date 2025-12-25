import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BaseQuery, BaseQueryProps, QueryHandler } from '@workspace/backend-core';
import { AggregateCodeEnum, asQueryCode, BoardSlug } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../../domain';

type ListBoardManagersQueryProps = BaseQueryProps<{
  boardSlug: BoardSlug;
}>;

export class ListBoardManagersQuery extends BaseQuery<
  ListBoardManagersQueryProps,
  ManagerEntity[],
  HandlerResult<ListBoardManagersQueryHandler>
> {
  static readonly code = asQueryCode('community:manager:qry:list_board_managers');
  readonly resourceType = AggregateCodeEnum.Community.Manager;

  constructor(data: ListBoardManagersQueryProps['data']) {
    super(null, data);
  }
}

@QueryHandler(ListBoardManagersQuery)
export class ListBoardManagersQueryHandler {
  constructor(private readonly repo: ManagerRepositoryPort) {}

  async execute({ data }: ListBoardManagersQueryProps) {
    const managers = await this.repo.findAllByBoardSlug(data.boardSlug);
    return ok(managers);
  }
}
