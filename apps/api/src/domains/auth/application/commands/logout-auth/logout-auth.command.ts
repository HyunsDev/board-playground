import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class LogoutAuthCommand extends CommandBase<LogoutAuthCommandResult> {
  public readonly refreshToken: string;

  constructor(props: { refreshToken: string }) {
    super(props);
    this.refreshToken = props.refreshToken;
  }
}
export type LogoutAuthCommandResult = DomainResult<null, never>;

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthCommandHandler
  implements ICommandHandler<LogoutAuthCommand, LogoutAuthCommandResult>
{
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutAuthCommand) {
    const hashedRefreshToken = this.tokenService.hashToken(command.refreshToken);

    const tokenResult =
      await this.refreshTokenService.getOneByHashedRefreshToken(hashedRefreshToken);
    if (tokenResult.isErr()) {
      return ok(null);
    }

    const token = tokenResult.value;
    await this.sessionService.revoke(token.sessionId);

    return ok(null);
  }
}
