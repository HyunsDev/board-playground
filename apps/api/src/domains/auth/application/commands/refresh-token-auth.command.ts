import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { InvalidRefreshTokenError } from '@/domains/session/domain/token.domain-errors';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type RefreshTokenAuthCommandProps = CommandProps<{
  refreshToken: string;
}>;
export class RefreshTokenAuthCommand extends BaseCommand<
  RefreshTokenAuthCommandProps,
  HandlerResult<RefreshTokenAuthCommandHandler>,
  {
    accessToken: string;
    refreshToken: string;
  }
> {}

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthCommandHandler implements ICommandHandler<RefreshTokenAuthCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: RefreshTokenAuthCommandProps) {
    return await this.txManager.run(async () => {
      const hashedRefreshToken = this.tokenService.hashToken(data.refreshToken);

      const tokenResult =
        await this.refreshTokenService.getOneByHashedRefreshToken(hashedRefreshToken);
      if (tokenResult.isErr()) {
        return matchError(tokenResult.error, {
          InvalidRefreshToken: () => err(new InvalidRefreshTokenError()),
        });
      }
      const token = tokenResult.value;

      const sessionResult = await this.sessionService.getOneById(token.sessionId);
      if (sessionResult.isErr()) {
        return matchError(sessionResult.error, {
          SessionNotFound: () => err(new InvalidRefreshTokenError()),
        });
      }
      const session = sessionResult.value;

      const userResult = await this.userFacade.getOneById(session.userId);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: (e) => err(e),
        });
      }
      const user = userResult.value;

      const newAccessToken = this.tokenService.generateAccessToken({
        sub: user.id,
        role: user.role,
        email: user.email,
        sessionId: session.id,
      });

      const refreshTokens = this.tokenService.generateRefreshToken();

      const rotateResult = await this.refreshTokenService.rotate(
        hashedRefreshToken,
        refreshTokens.hashedRefreshToken,
      );
      if (rotateResult.isErr()) return err(rotateResult.error);

      return ok({
        accessToken: newAccessToken,
        refreshToken: refreshTokens.refreshToken,
      });
    });
  }
}
