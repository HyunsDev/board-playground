import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { MessageResult } from '@workspace/backend-ddd';

import { MessageContext } from '../context';

import { BaseCommand } from '@/base';
import { CommandDispatcherPort } from '@/base/messages/ports';

@Injectable()
export class CommandDispatcher implements CommandDispatcherPort {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly messageContext: MessageContext,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute<TCommand extends BaseCommand<any, any, any>>(
    command: TCommand,
  ): Promise<MessageResult<TCommand>> {
    command.updateMetadata(this.messageContext.getOrThrowDrivenMetadata());
    return this.commandBus.execute<TCommand>(command);
  }
}
