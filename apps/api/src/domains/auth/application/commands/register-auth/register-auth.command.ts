import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import {
  UserEmailAlreadyExistsError,
  UserUsernameAlreadyExistsError,
} from '@/domains/user/domain/user.errors';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { PasswordService } from '@/infra/security/services/password.service';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase, CommandProps, DomainError } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class RegisterAuthCommand extends CommandBase<RegisterAuthCommandResult> {
  public readonly email: string;
  public readonly username: string;
  public readonly nickname: string;
  public readonly password: string;
  public readonly ipAddress: string;
  public readonly userAgent: string;

  constructor(props: CommandProps<RegisterAuthCommand, RegisterAuthCommandResult>) {
    super(props);
    this.email = props.email;
    this.username = props.username;
    this.nickname = props.nickname;
    this.password = props.password;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
  }
}

export type RegisterAuthCommandResult = DomainResult<
  {
    accessToken: string;
    refreshToken: string;
  },
  UserEmailAlreadyExistsError | UserUsernameAlreadyExistsError | DomainError
>;

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, RegisterAuthCommandResult>
{
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: RegisterAuthCommand) {
    return await this.txManager.run(async () => {
      const hashedPassword = await this.passwordService.hashPassword(command.password);

      const createUserResult = await this.userFacade.createUser({
        email: command.email,
        username: command.username,
        nickname: command.nickname,
        password: hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      const refreshTokens = this.tokenService.generateRefreshToken();

      const createSessionResult = await this.sessionService.create({
        userId: createUserResult.value.id,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
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
