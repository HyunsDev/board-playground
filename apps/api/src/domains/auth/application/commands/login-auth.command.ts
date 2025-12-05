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
import { CommandBase, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

export class LoginAuthCommand extends CommandBase {
  public readonly email: string;
  public readonly password: string;
  public readonly ipAddress: string;
  public readonly userAgent: string;

  constructor(props: CommandProps<LoginAuthCommand>) {
    super(props);
    this.email = props.email!;
    this.password = props.password!;
    this.ipAddress = props.ipAddress!;
    this.userAgent = props.userAgent!;
  }
}

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

  async execute(command: LoginAuthCommand) {
    return await this.txManager.run(async () => {
      const user = await this.userFacade.findOneByEmail(command.email);
      if (!user) return err(new InvalidCredentialsError());

      const isValid = await this.passwordService.comparePassword(command.password, user.password);
      if (!isValid) return err(new InvalidCredentialsError());

      const refreshTokens = this.tokenService.generateRefreshToken();

      const createSessionResult = await this.sessionService.create({
        userId: user.id,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
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
