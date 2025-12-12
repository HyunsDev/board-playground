import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { DEVICE_PLATFORM } from '@workspace/contract';

import { InvalidCredentialsError } from '../../auth.domain-error';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { PasswordProvider } from '@/infra/security/providers/password.provider';
import { TokenProvider } from '@/infra/security/providers/token.provider';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { AuthTokens } from '@/shared/types/tokens';
import { matchError } from '@/shared/utils/match-error.utils';

type ILoginAuthCommand = ICommand<{
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class LoginAuthCommand extends BaseCommand<
  ILoginAuthCommand,
  HandlerResult<LoginAuthCommandHandler>,
  AuthTokens
> {
  readonly code = CommandCodes.Auth.Login;
  readonly resourceType = ResourceTypes.User;

  constructor(data: ILoginAuthCommand['data'], metadata: ILoginAuthCommand['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler implements ICommandHandler<LoginAuthCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordProvider: PasswordProvider,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: ILoginAuthCommand) {
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

      const validResult = await this.passwordProvider.compare(
        command.data.password,
        user.password.hashedValue,
      );
      if (!validResult) return err(new InvalidCredentialsError());

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
      const accessToken = this.tokenProvider.generateAccessToken({
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
