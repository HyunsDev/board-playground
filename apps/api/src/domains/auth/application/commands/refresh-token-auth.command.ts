import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionService } from '@/domains/session/application/services/session.service';
import {
  InvalidRefreshTokenError,
  TokenReuseDetectedError,
} from '@/domains/session/domain/token.domain-errors';
import { UserService } from '@/domains/user/application/services/user.service';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';
import { AuthTokens } from '@/shared/types/tokens';
import { matchError } from '@/shared/utils/match-error.utils';

type IRefreshTokenAuthCommand = ICommand<{
  refreshToken: string;
}>;
export class RefreshTokenAuthCommand extends BaseCommand<
  IRefreshTokenAuthCommand,
  HandlerResult<RefreshTokenAuthCommandHandler>,
  | {
      status: 'success';
      data: AuthTokens;
    }
  | {
      status: 'failed';
      error: TokenReuseDetectedError;
    }
> {
  readonly domain = DomainCodes.Auth;
  readonly code = CommandCodes.Auth.RefreshToken;
  readonly resourceType = ResourceTypes.User;

  constructor(
    data: IRefreshTokenAuthCommand['data'],
    metadata: IRefreshTokenAuthCommand['metadata'],
  ) {
    super(null, data, metadata);
  }
}

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthCommandHandler implements ICommandHandler<RefreshTokenAuthCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: IRefreshTokenAuthCommand) {
    return await this.txManager.run(async () => {
      const sessionResult = await this.sessionService.rotate(command.data.refreshToken);
      if (sessionResult.isErr()) {
        return matchError(sessionResult.error, {
          InvalidRefreshToken: (e) => err(e),
          SessionClosed: (e) => err(e),
          SessionRevoked: (e) => err(e),
          ExpiredToken: (e) => err(e),
        });
      }

      const sessionOkResult = sessionResult.value;
      if (sessionOkResult.status === 'failed') {
        return ok(sessionOkResult);
      }

      const user = await this.userService.getOneById(sessionOkResult.data.session.userId);
      if (user.isErr())
        return matchError(user.error, {
          UserNotFound: () => err(new InvalidRefreshTokenError()),
        });

      const accessToken = this.tokenService.generateAccessToken({
        sub: user.value.id,
        email: user.value.email,
        role: user.value.role,
        sessionId: sessionOkResult.data.session.id,
      });

      return ok({
        status: 'success' as const,
        data: {
          accessToken: accessToken,
          refreshToken: sessionOkResult.data.refreshToken,
        },
      });
    });
  }
}
