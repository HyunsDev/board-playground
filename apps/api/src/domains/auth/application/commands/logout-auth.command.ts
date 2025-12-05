import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

export class LogoutAuthCommand extends CommandBase {
  public readonly refreshToken: string;

  constructor(props: CommandProps<LogoutAuthCommand>) {
    super(props);
    this.refreshToken = props.refreshToken;
  }
}
export type LogoutAuthCommandResult = HandlerResult<LogoutAuthCommandHandler>;

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthCommandHandler implements ICommandHandler<LogoutAuthCommand> {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: LogoutAuthCommand) {
    return await this.txManager.run(async () => {
      const hashedRefreshToken = this.tokenService.hashToken(command.refreshToken);

      const tokenResult =
        await this.refreshTokenService.getOneByHashedRefreshToken(hashedRefreshToken);
      if (tokenResult.isErr()) {
        return ok(null);
      }

      const token = tokenResult.value;
      const revokeRes = await this.sessionService.revoke(token.sessionId);
      if (revokeRes.isErr()) {
        return ok(null);
      }

      return ok(null);
    });
  }
}
