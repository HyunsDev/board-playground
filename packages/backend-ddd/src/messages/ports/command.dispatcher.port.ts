/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '../message.types';
import { AbstractCommand, AbstractCommandProps } from '../messages/abstract.command';

export abstract class CommandDispatcherPort {
  abstract execute<C extends AbstractCommand<string, string, string, AbstractCommandProps<any>>>(
    command: C,
  ): Promise<MessageResult<C>>;
}
