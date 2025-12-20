import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { MessageResult } from '@workspace/backend-ddd';

import { BaseCommand } from '@/base';
import { CommandDispatcherPort } from '@/base/messages/ports';

@Injectable()
export class CommandDispatcher implements CommandDispatcherPort {
  constructor(private readonly commandBus: CommandBus) {}

  async execute<TCommand extends BaseCommand<any, any, any>>(
    command: TCommand,
  ): Promise<MessageResult<TCommand>> {
    return this.commandBus.execute<TCommand>(command);
  }
}
