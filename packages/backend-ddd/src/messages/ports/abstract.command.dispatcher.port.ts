/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '../message.types';
import { AbstractCommand } from '../messages/abstract.command';

export abstract class AbstractCommandDispatcherPort {
  abstract execute<C extends AbstractCommand<any, any, any, any, any, any>>(
    command: C,
  ): Promise<MessageResult<C>>;
}
