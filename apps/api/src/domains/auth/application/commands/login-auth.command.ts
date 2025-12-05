import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { InvalidCredentialsError } from '@/infra/security/domain/security.domain-errors';
import { PasswordService } from '@/infra/security/services/password.service';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type LoginAuthCommandProps = CommandProps<{
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class LoginAuthCommand extends BaseCommand<
  LoginAuthCommandProps,
  HandlerResult<LoginAuthCommandHandler>,
  {
    accessToken: string;
    refreshToken: string;
  }
> {}

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler implements ICommandHandler<LoginAuthCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: LoginAuthCommandProps) {
    return await this.txManager.run(async () => {
      const user = await this.userFacade.findOneByEmail(data.email);
      if (!user) return err(new InvalidCredentialsError());

      const isValid = await this.passwordService.comparePassword(data.password, user.password);
      if (!isValid) return err(new InvalidCredentialsError());

      const refreshTokens = this.tokenService.generateRefreshToken();

      const createSessionResult = await this.sessionService.create({
        userId: user.id,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (createSessionResult.isErr()) return err(createSessionResult.error);
      const session = createSessionResult.value;

      const createRefreshTokenResult = await this.refreshTokenService.createNew(
        session.id,
        refreshTokens.hashedRefreshToken,
      );
      if (createRefreshTokenResult.isErr()) return err(createRefreshTokenResult.error);

      const accessToken = this.tokenService.generateAccessToken({
        sub: user.id,
        role: user.role,
        email: user.email,
        sessionId: session.id,
      });

      return ok({
        accessToken,
        refreshToken: refreshTokens.refreshToken,
      });
    });
  }
}

export type LoginAuthCommandResult = HandlerResult<LoginAuthCommandHandler>;
