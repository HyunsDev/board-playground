import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';

import { SESSION_REPOSITORY } from '../../session.constants';

import { CurrentSessionCannotBeDeletedError } from '@/domains/session/domain/session.domain-errors';
import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';

type IDeleteSessionCommand = ICommand<{
  sessionId: string;
  userId: string;
  currentSessionId: string;
}>;

export class DeleteSessionCommand extends BaseCommand<
  IDeleteSessionCommand,
  HandlerResult<DeleteSessionCommandHandler>,
  void
> {
  readonly code = CommandCodes.Session.Delete;
  readonly resourceType = ResourceTypes.Session;

  constructor(data: IDeleteSessionCommand['data'], metadata: IDeleteSessionCommand['metadata']) {
    super(data.sessionId, data, metadata);
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionCommandHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: IDeleteSessionCommand) {
    return await this.txManager.run(async () => {
      if (command.data.sessionId === command.data.currentSessionId) {
        return err(new CurrentSessionCannotBeDeletedError());
      }
      const sessionResult = await this.sessionRepo.getOneByIdAndUserId(
        command.data.sessionId,
        command.data.userId,
      );
      if (sessionResult.isErr()) {
        return err(sessionResult.error);
      }
      const session = sessionResult.value;
      return (await this.sessionRepo.delete(session)).match(
        () => ok(),
        (error) => err(error),
      );
    });
  }
}
