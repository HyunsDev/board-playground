import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { InvalidRefreshTokenError } from '@/domains/session/domain/token.domain-errors';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { TokenProvider } from '@/infra/security/providers/token.provider';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { AuthTokens } from '@/shared/types/tokens';
import { matchError } from '@/shared/utils/match-error.utils';
import { TypedData, typedOk } from '@/shared/utils/typed-ok.utils';

type IRefreshTokenAuthCommand = ICommand<{
  refreshToken: string;
}>;
export class RefreshTokenAuthCommand extends BaseCommand<
  IRefreshTokenAuthCommand,
  HandlerResult<RefreshTokenAuthCommandHandler>,
  | TypedData<'rotated', AuthTokens>
  | TypedData<
      'revoked',
      {
        reason: 'TokenReuseDetected';
      }
    >
> {
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
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly tokenProvider: TokenProvider,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: IRefreshTokenAuthCommand) {
    return await this.txManager.run(async () => {
      const sessionResult = await this.sessionFacade.rotate(command.data.refreshToken);
      if (sessionResult.isErr()) {
        return matchError(sessionResult.error, {
          InvalidRefreshToken: (e) => err(e),
          SessionClosed: (e) => err(e),
          SessionRevoked: (e) => err(e),
          ExpiredToken: (e) => err(e),
        });
      }

      const sessionOkResult = sessionResult.value;
      if (sessionOkResult.type === 'revoked') {
        return typedOk('revoked', { reason: 'TokenReuseDetected' });
      }

      const user = await this.userFacade.getOneById(sessionOkResult.session.userId);
      if (user.isErr())
        return matchError(user.error, {
          UserNotFound: () => err(new InvalidRefreshTokenError()),
        });

      const accessToken = this.tokenProvider.generateAccessToken({
        sub: user.value.id,
        email: user.value.email,
        role: user.value.role,
        sessionId: sessionOkResult.session.id,
      });

      return typedOk('rotated', {
        accessToken: accessToken,
        refreshToken: sessionOkResult.refreshToken,
      });
    });
  }
}
