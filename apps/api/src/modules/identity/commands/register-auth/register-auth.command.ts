import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { CommandBase, CommandProps } from '@/libs/ddd';
import { PasswordService } from '@/modules/auth/services/password.service';
import { TokenService } from '@/modules/auth/services/token.service';
import { CreateDeviceService } from '@/modules/device/services/create-device.service';
import { TransactionManager } from '@/modules/prisma/transaction.manager';
import {
  UserEmailAlreadyExistsException,
  UserUsernameAlreadyExistsException,
} from '@/modules/user/domain/user.exceptions';
import { CreateUserService } from '@/modules/user/services/create-user.service';

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
    private readonly createUserService: CreateUserService,
    private readonly createDeviceService: CreateDeviceService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: RegisterAuthCommand) {
    const userEmailExists = await this.createUserService.checkEmailExists(command.email);
    if (userEmailExists) return err(new UserEmailAlreadyExistsException());

    const userNameExists = await this.createUserService.checkUsernameExists(command.username);
    if (userNameExists) return err(new UserUsernameAlreadyExistsException());

    const hashedPassword = await this.passwordService.hashPassword(command.password);

    return this.txManager.run(async () => {
      const createUserResult = await this.createUserService.create({
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
