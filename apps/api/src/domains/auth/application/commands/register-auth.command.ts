import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { PasswordService } from '@/infra/security/services/password.service';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type RegisterAuthCommandProps = CommandProps<{
  email: string;
  username: string;
  nickname: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class RegisterAuthCommand extends BaseCommand<
  RegisterAuthCommandProps,
  HandlerResult<RegisterAuthCommandHandler>,
  {
    accessToken: string;
    refreshToken: string;
  }
> {}

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, HandlerResult<RegisterAuthCommandHandler>>
{
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: RegisterAuthCommandProps) {
    return await this.txManager.run(async () => {
      const hashedPassword = await this.passwordService.hashPassword(data.password);

      const createUserResult = await this.userFacade.createUser({
        email: data.email,
        username: data.username,
        nickname: data.nickname,
        password: hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      const refreshTokens = this.tokenService.generateRefreshToken();

      const createSessionResult = await this.sessionService.create({
        userId: createUserResult.value.id,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (createSessionResult.isErr()) return err(createSessionResult.error);

      const createRefreshTokenResult = await this.refreshTokenService.createNew(
        createSessionResult.value.id,
        refreshTokens.hashedRefreshToken,
      );
      if (createRefreshTokenResult.isErr()) return err(createRefreshTokenResult.error);

      const accessToken = this.tokenService.generateAccessToken({
        sub: createUserResult.value.id,
        role: createUserResult.value.role,
        email: createUserResult.value.email,
        sessionId: createSessionResult.value.id,
      });

      return ok({
        accessToken,
        refreshToken: refreshTokens.refreshToken,
      });
    });
  }
}
