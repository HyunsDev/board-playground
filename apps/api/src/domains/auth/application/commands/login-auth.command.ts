import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { SessionService } from '@/domains/session/application/services/session.service';
import { UserService } from '@/domains/user/application/services/user.service';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { InvalidCredentialsError } from '@/infra/security/domain/security.domain-errors';
import { TokenProvider } from '@/infra/security/token.provider';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';
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
  readonly domain = DomainCodes.Auth;
  readonly code = CommandCodes.Auth.Login;
  readonly resourceType = ResourceTypes.User;

  constructor(data: ILoginAuthCommand['data'], metadata: ILoginAuthCommand['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler implements ICommandHandler<LoginAuthCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenProvider: TokenProvider,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: ILoginAuthCommand) {
    return await this.txManager.run(async () => {
      const userResult = await this.userService.getOneByEmail(command.data.email);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }
      const user = userResult.value;

      if (!user.password) {
        return err(new InvalidCredentialsError());
      }

      const validResult = await user.password.compare(command.data.password);
      if (validResult.isErr()) return validResult;

      const sessionResult = await this.sessionService.create({
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
