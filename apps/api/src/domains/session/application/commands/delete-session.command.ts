import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { CurrentSessionCannotBeDeletedError } from '@/domains/session/domain/session.domain-errors';
import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { SESSION_REPOSITORY } from '@/domains/session/session.di-tokens';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type DeleteSessionCommandProps = CommandProps<{
  sessionId: string;
  userId: string;
  currentSessionId: string;
}>;

export class DeleteSessionCommand extends BaseCommand<
  DeleteSessionCommandProps,
  HandlerResult<DeleteSessionCommandHandler>,
  void
> {}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionCommandHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute({ data }: DeleteSessionCommandProps) {
    if (data.sessionId === data.currentSessionId) {
      return err(new CurrentSessionCannotBeDeletedError());
    }
    const sessionResult = await this.sessionRepo.getOneByIdAndUserId(data.sessionId, data.userId);
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
