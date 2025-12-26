import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BaseQueryProps, BaseQuery, QueryHandler } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { asQueryCode, AggregateCodeEnum } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../../domain';

type ListUserManagersQueryProps = BaseQueryProps<{
  userId: UserId;
}>;

export class ListUserManagersQuery extends BaseQuery<
  ListUserManagersQueryProps,
  ManagerEntity[],
  HandlerResult<ListUserManagersQueryHandler>
> {
  static readonly code = asQueryCode('community:manager:qry:list_user_managers');
  readonly resourceType = AggregateCodeEnum.Community.Manager;

  constructor(data: ListUserManagersQueryProps['data']) {
    super(null, data);
  }
}

@QueryHandler(ListUserManagersQuery)
export class ListUserManagersQueryHandler {
  constructor(private readonly repo: ManagerRepositoryPort) {}

  async execute({ data }: ListUserManagersQueryProps) {
    const managers = await this.repo.findAllByUserId(data.userId);
    return ok(managers);
  }
}
