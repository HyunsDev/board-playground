import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { CurrentSessionCannotBeDeletedError } from '@/domains/session/domain/session.domain-errors';
import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { SESSION_REPOSITORY } from '@/domains/session/session.di-tokens';
import { CommandBase, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

export class DeleteSessionCommand extends CommandBase {
  public readonly sessionId: string;
  public readonly userId: string;
  public readonly currentSessionId: string;

  constructor(props: CommandProps<DeleteSessionCommand>) {
    super(props);
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.currentSessionId = props.currentSessionId;
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionCommandHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(command: DeleteSessionCommand) {
    if (command.sessionId === command.currentSessionId) {
      return err(new CurrentSessionCannotBeDeletedError());
    }
    const sessionResult = await this.sessionRepo.getOneByIdAndUserId(
      command.sessionId,
      command.userId,
    );
    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }
    const session = sessionResult.value;
    return (await this.sessionRepo.delete(session)).match(
      () => ok(),
      (error) => err(error),
    );
  }
}

export type DeleteSessionCommandResult = HandlerResult<DeleteSessionCommandHandler>;
