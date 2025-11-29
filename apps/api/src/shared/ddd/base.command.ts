import { Command } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

export type CommandProps<T, TRes> = Omit<T, keyof CommandBase<TRes>> & Partial<CommandBase<TRes>>;

export type CommandMetadata = {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: number;
};

export abstract class CommandBase<TRes> extends Command<TRes> {
  readonly id: string;
  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<CommandBase<TRes>, TRes>) {
    super();
    this.id = props.id || uuidv7();

    this.metadata = {
      correlationId: props?.metadata?.correlationId,
      causationId: props?.metadata?.causationId,
      userId: props?.metadata?.userId,
      timestamp: props?.metadata?.timestamp || Date.now(),
    };
  }
}
