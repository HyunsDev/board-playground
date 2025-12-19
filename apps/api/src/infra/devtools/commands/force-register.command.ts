import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { AccessTokenProvider, DrivenMessageMetadata } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { AuthTokens } from '@/shared/types/tokens';

type ForceRegisterCommandProps = BaseCommandProps<{
  email: string;
  username: string;
  nickname: string;
}>;

export class ForceRegisterCommand extends BaseCommand<
  ForceRegisterCommandProps,
  AuthTokens,
  HandlerResult<ForceRegisterCommandHandler>
> {
  static readonly code = defineCommandCode('system:devtools:cmd:force_register');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ForceRegisterCommandProps['data'], metadata: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(ForceRegisterCommand)
export class ForceRegisterCommandHandler implements ICommandHandler<ForceRegisterCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly accessTokenProvider: AccessTokenProvider,
  ) {}

  async execute({ data }: ForceRegisterCommandProps) {
    const createUserResult = await this.userFacade.create({
      email: data.email,
      username: data.username,
      nickname: data.nickname,
      hashedPassword: null,
    });
    if (createUserResult.isErr()) return err(createUserResult.error);
    const user = createUserResult.value;

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
