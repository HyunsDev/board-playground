import { MessageResult } from '@workspace/backend-ddd';

import { BaseQuery, BaseQueryProps } from '../messages';

export interface IQueryHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQuery extends BaseQuery<BaseQueryProps<any>, any, any>,
> {
  execute(query: TQuery): MessageResult<TQuery>;
}
