import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { AccessTokenProvider, TransactionManager } from '@workspace/backend-core';
import { BaseICommand, BaseCommand } from '@workspace/backend-core';
import { TypedData, matchError, typedOk } from '@workspace/backend-ddd';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { InvalidRefreshTokenError } from '@/domains/session/domain/token.domain-errors';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { AuthTokens } from '@/shared/types/tokens';

type IRefreshTokenAuthCommand = BaseICommand<{
  refreshToken: string;
}>;

type RefreshTokenAuthCommandResult =
  | TypedData<'rotated', AuthTokens>
  | TypedData<
      'revoked',
      {
        reason: 'TokenReuseDetected';
      }
    >;

export class RefreshTokenAuthCommand extends BaseCommand<
  IRefreshTokenAuthCommand,
  HandlerResult<RefreshTokenAuthCommandHandler>,
  RefreshTokenAuthCommandResult
> {
  readonly code = defineCommandCode('account:auth:cmd:refresh_token');
  readonly resourceType = AggregateCodeEnum.Account.User;

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
    private readonly accessTokenProvider: AccessTokenProvider,
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

      const accessToken = this.accessTokenProvider.generateAccessToken({
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
