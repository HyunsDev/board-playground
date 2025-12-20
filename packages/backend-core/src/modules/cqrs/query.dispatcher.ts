import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { MessageResult } from '@workspace/backend-ddd';

import { MessageContext } from '../context';

import { BaseQuery, QueryDispatcherPort } from '@/base';

@Injectable()
export class QueryDispatcher implements QueryDispatcherPort {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly messageContext: MessageContext,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute<TQuery extends BaseQuery<any, any, any>>(
    query: TQuery,
  ): Promise<MessageResult<TQuery>> {
    query.updateMetadata(this.messageContext.getOrThrowDrivenMetadata());
    return this.queryBus.execute<TQuery>(query);
  }
}
