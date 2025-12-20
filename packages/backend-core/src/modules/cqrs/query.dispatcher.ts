import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  AbstractCommand,
  MessageResult,
  AbstractQueryDispatcherPort,
} from '@workspace/backend-ddd';

@Injectable()
export class QueryDispatcher implements AbstractQueryDispatcherPort {
  constructor(private readonly commandBus: CommandBus) {}

  async execute<TCommand extends AbstractCommand>(
    command: TCommand,
  ): Promise<MessageResult<TCommand>> {
    return this.commandBus.execute<TCommand>(command);
  }
}
