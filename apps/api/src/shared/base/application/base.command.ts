import { Command } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

export type CommandMetadata = {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: number;
};

export type CommandProps<T> = Omit<T, keyof CommandBase> &
  Partial<Pick<CommandBase, 'metadata' | 'id'>>;

export abstract class CommandBase<TRes = any> extends Command<TRes> {
  readonly id: string;
  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<TRes>) {
    super();
    this.id = props.id || uuidv7();

    this.metadata = {
      // correlationId가 없으면 현재 커맨드의 ID를 사용 (Trace 시작점)
      correlationId: props.metadata?.correlationId || this.id,
      causationId: props.metadata?.causationId,
      userId: props.metadata?.userId,
      timestamp: props.metadata?.timestamp || Date.now(),
    };
  }
}
