/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageResult } from '@workspace/backend-ddd';

import { BaseQuery, BaseQueryProps } from '../messages/base.query';

export abstract class QueryDispatcherPort {
  abstract execute<C extends BaseQuery<BaseQueryProps<any>, any, any>>(query: C): MessageResult<C>;
}
