import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { AccessTokenProvider, DrivenMessageMetadata } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { UserEmail } from '@workspace/domain';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { AuthTokens } from '@/shared/types/tokens';

type IForceLoginCommand = BaseCommandProps<{
  email: UserEmail;
}>;

export class ForceLoginCommand extends BaseCommand<
  IForceLoginCommand,
  AuthTokens,
  HandlerResult<ForceLoginCommandHandler>
> {
  static readonly code = asCommandCode('system:devtools:cmd:force_login');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IForceLoginCommand['data'], metadata?: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(ForceLoginCommand)
export class ForceLoginCommandHandler implements ICommandHandler<ForceLoginCommand> {
  constructor(
    private readonly sessionFacade: SessionFacade,
    private readonly accessTokenProvider: AccessTokenProvider,
    private readonly userFacade: UserFacade,
  ) {}

  async execute({ data }: IForceLoginCommand) {
    const userResult = await this.userFacade.getOneByEmail(data.email);
    if (userResult.isErr()) {
      return err(userResult.error);
    }
    const user = userResult.value;

    const sessionResult = await this.sessionFacade.create({
      userId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Devtools',
      platform: 'WEB',
    });

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }
    const { session, refreshToken } = sessionResult.value;
    const accessToken = this.accessTokenProvider.generateAccessToken({
      sub: user.id,
      sessionId: session.id,
      email: user.email,
      role: user.role,
    });

    return ok({
      accessToken,
      refreshToken,
    });
  }
}
