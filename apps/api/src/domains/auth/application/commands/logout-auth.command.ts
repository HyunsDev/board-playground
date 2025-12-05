import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
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
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: LogoutAuthCommandProps) {
    return await this.txManager.run(async () => {
      const hashedRefreshToken = this.tokenService.hashToken(data.refreshToken);
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
