import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { SessionService } from '@/domains/session/application/services/session.service';
import { UserService } from '@/domains/user/application/services/user.service';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { InvalidCredentialsError } from '@/infra/security/domain/security.domain-errors';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { AuthTokens } from '@/shared/types/tokens';
import { matchError } from '@/shared/utils/match-error.utils';

type LoginAuthCommandProps = CommandProps<{
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class LoginAuthCommand extends BaseCommand<
  LoginAuthCommandProps,
  HandlerResult<LoginAuthCommandHandler>,
  AuthTokens
> {}

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler implements ICommandHandler<LoginAuthCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: LoginAuthCommandProps) {
    return await this.txManager.run(async () => {
      const userResult = await this.userService.getOneByEmail(data.email);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }
      const user = userResult.value;

      const validResult = await user.password.compare(data.password);
      if (validResult.isErr()) return validResult;

      const sessionResult = await this.sessionService.create({
        userId: user.id,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (sessionResult.isErr()) {
        return err(sessionResult.error);
      }
      const { session, refreshToken } = sessionResult.value;
      const accessToken = this.tokenService.generateAccessToken({
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
