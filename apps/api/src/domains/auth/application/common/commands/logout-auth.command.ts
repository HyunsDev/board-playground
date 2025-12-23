import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { DrivenMessageMetadata, TransactionManager } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';

type ILogoutAuthCommand = BaseCommandProps<{
  refreshToken: string;
}>;
export class LogoutAuthCommand extends BaseCommand<
  ILogoutAuthCommand,
  void,
  HandlerResult<LogoutAuthCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:logout');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ILogoutAuthCommand['data'], metadata?: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthCommandHandler implements ICommandHandler<LogoutAuthCommand> {
  constructor(
    private readonly sessionFacade: SessionFacade,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: ILogoutAuthCommand) {
    return await this.txManager.run(async () => {
      return (await this.sessionFacade.close(command.data.refreshToken)).match(
        () => ok(undefined),
        (e) => err(e),
      );
    });
  }
}
