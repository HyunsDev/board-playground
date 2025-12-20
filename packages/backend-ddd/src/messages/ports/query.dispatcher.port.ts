/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageResult } from '../message.types';
import { AbstractQuery, AbstractQueryProps } from '../messages/abstract.query';

export abstract class QueryDispatcherPort {
  abstract execute<C extends AbstractQuery<string, string, string, AbstractQueryProps<any>>>(
    command: C,
  ): Promise<MessageResult<C>>;
}
