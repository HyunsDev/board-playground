import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';

type ILogoutAuthCommand = ICommand<{
  refreshToken: string;
}>;
export class LogoutAuthCommand extends BaseCommand<
  ILogoutAuthCommand,
  HandlerResult<LogoutAuthCommandHandler>,
  void
> {
  readonly code = CommandCodes.Auth.Logout;
  readonly resourceType = ResourceTypes.User;

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
