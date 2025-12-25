import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  AccessTokenProvider,
  DrivenMessageMetadata,
  TransactionManager,
} from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { matchError } from '@workspace/backend-ddd';
import { UserEmail } from '@workspace/common';
import { DEVICE_PLATFORM } from '@workspace/contract';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { InvalidCredentialsError } from '../../../auth.domain-error';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { PasswordProvider } from '@/infra/crypto';
import { AuthTokens } from '@/shared/types/tokens';

type LoginWithPasswordCommandProps = BaseCommandProps<{
  email: UserEmail;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class LoginWithPasswordCommand extends BaseCommand<
  LoginWithPasswordCommandProps,
  AuthTokens,
  HandlerResult<LoginWithPasswordCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:login');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: LoginWithPasswordCommandProps['data'], metadata?: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(LoginWithPasswordCommand)
export class LoginWithPasswordCommandHandler implements ICommandHandler<LoginWithPasswordCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly AccessTokenProvider: AccessTokenProvider,
    private readonly passwordProvider: PasswordProvider,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: LoginWithPasswordCommandProps) {
    return await this.txManager.run(async () => {
      const userResult = await this.userFacade.getOneByEmail(command.data.email);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }
      const user = userResult.value;

      if (!user.password) {
        return err(new InvalidCredentialsError());
      }

      const isPasswordValid = await this.passwordProvider.compare(
        command.data.password,
        user.password.hashedValue,
      );
      if (!isPasswordValid) return err(new InvalidCredentialsError());

      const sessionResult = await this.sessionFacade.create({
        userId: user.id,
        userAgent: command.data.userAgent,
        ipAddress: command.data.ipAddress,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (sessionResult.isErr()) {
        return err(sessionResult.error);
      }
      const { session, refreshToken } = sessionResult.value;
      const accessToken = this.AccessTokenProvider.generateAccessToken({
        sub: user.id,
        sessionId: session.id,
        email: user.email,
        role: user.role,
      });

      return ok({
        accessToken,
        refreshToken,
      });
    });
  }
}
