import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionService } from '@/domains/session/application/services/session.service';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type LogoutAuthCommandProps = CommandProps<{
  refreshToken: string;
}>;
export class LogoutAuthCommand extends BaseCommand<
  LogoutAuthCommandProps,
  HandlerResult<LogoutAuthCommandHandler>,
  void
> {}

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthCommandHandler implements ICommandHandler<LogoutAuthCommand> {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: LogoutAuthCommandProps) {
    return await this.txManager.run(async () => {
      return await this.sessionService.close(data.refreshToken);
    });
  }
}
