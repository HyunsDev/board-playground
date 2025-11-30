import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { CreateDeviceService } from '@/domains/device/services/create-device.service';
import {
  UserEmailAlreadyExistsException,
  UserUsernameAlreadyExistsException,
} from '@/domains/user/domain/user.exceptions';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { PasswordService } from '@/infra/security/services/password.service';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase, CommandProps } from '@/shared/base';

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

export type RegisterAuthCommandResult = Result<
  {
    accessToken: string;
    refreshToken: string;
  },
  UserEmailAlreadyExistsException | UserUsernameAlreadyExistsException | Error
>;

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, RegisterAuthCommandResult>
{
  constructor(
    private readonly userFacade: UserFacade,
    private readonly createDeviceService: CreateDeviceService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: RegisterAuthCommand) {
    const hashedPassword = await this.passwordService.hashPassword(command.password);

    return this.txManager.run(async () => {
      const createUserResult = await this.userFacade.createUser({
        email: command.email,
        username: command.username,
        nickname: command.nickname,
        password: hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      const refreshTokens = this.tokenService.generateRefreshToken();

      const createDeviceResult = await this.createDeviceService.create({
        userId: createUserResult.value.id,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        hashedRefreshToken: refreshTokens.hashedRefreshToken,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (createDeviceResult.isErr()) return err(createDeviceResult.error);

      const accessToken = this.tokenService.generateAccessToken({
        sub: createUserResult.value.id,
        role: createUserResult.value.role,
        email: createUserResult.value.email,
        deviceId: createDeviceResult.value.id,
      });

      return ok({
        accessToken,
        refreshToken: refreshTokens.refreshToken,
      });
    });
  }
}
