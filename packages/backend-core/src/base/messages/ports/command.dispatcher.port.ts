/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '@workspace/backend-ddd';

import { BaseCommand } from '../messages/base.command';

export abstract class CommandDispatcherPort {
  abstract execute<C extends BaseCommand<any, any, any>>(command: C): Promise<MessageResult<C>>;
}
