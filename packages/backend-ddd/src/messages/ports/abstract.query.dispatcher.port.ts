/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageResult } from '../message.types';
import { AbstractQuery, AbstractQueryProps } from '../messages/abstract.query';

export abstract class AbstractQueryDispatcherPort {
  abstract execute<C extends AbstractQuery<any, any, any, AbstractQueryProps<any>, any, any>>(
    command: C,
  ): Promise<MessageResult<C>>;
}
