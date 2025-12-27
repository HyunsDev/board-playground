import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { DrivenMessageMetadata, TransactionManager } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { AggregateCodeEnum, asCommandCode, SessionId } from '@workspace/domain';

import { CurrentSessionCannotBeDeletedError } from '../../domain/session.domain-errors';

import { SessionRepositoryPort } from '@/domains/session/domain/session.repository.port';

type IDeleteSessionCommand = BaseCommandProps<{
  sessionId: SessionId;
  userId: UserId;
  currentSessionId: SessionId;
}>;

export class DeleteSessionCommand extends BaseCommand<
  IDeleteSessionCommand,
  void,
  HandlerResult<DeleteSessionCommandHandler>
> {
  static readonly code = asCommandCode('account:session:cmd:delete');
  readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: IDeleteSessionCommand['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionCommandHandler implements ICommandHandler<DeleteSessionCommand> {
  constructor(
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

      const deleteResult = await this.sessionRepo.delete(session);

      if (deleteResult.isErr()) {
        return err(deleteResult.error);
      }

      return ok(undefined);
    });
  }
}
