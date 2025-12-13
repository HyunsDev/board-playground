import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { TransactionManager } from '@workspace/backend-core';
import { BaseCommand, BaseICommand } from '@workspace/backend-core';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';

type ILogoutAuthCommand = BaseICommand<{
  refreshToken: string;
}>;
export class LogoutAuthCommand extends BaseCommand<
  ILogoutAuthCommand,
  HandlerResult<LogoutAuthCommandHandler>,
  void
> {
  readonly code = defineCommandCode('account:auth:cmd:logout');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ILogoutAuthCommand['data'], metadata: ILogoutAuthCommand['metadata']) {
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
