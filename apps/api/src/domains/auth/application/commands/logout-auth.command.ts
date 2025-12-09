import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type ILogoutAuthCommand = ICommand<{
  refreshToken: string;
}>;
export class LogoutAuthCommand extends BaseCommand<
  ILogoutAuthCommand,
  HandlerResult<LogoutAuthCommandHandler>,
  void
> {
  readonly domain = DomainCodes.Auth;
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
