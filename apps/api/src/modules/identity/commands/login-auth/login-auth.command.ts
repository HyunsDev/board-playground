import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { CommandBase, CommandProps } from '@/libs/ddd';
import { InvalidCredentialsException } from '@/modules/auth/domain/auth.exceptions';
import { PasswordService } from '@/modules/auth/services/password.service';
import { TokenService } from '@/modules/auth/services/token.service';
import { CreateDeviceService } from '@/modules/device/services/create-device.service';
import { UserRepositoryPort } from '@/modules/user/database/user.repository.port';
import { USER_REPOSITORY } from '@/modules/user/user.di-tokens';

export class LoginAuthCommand extends CommandBase<LoginAuthCommandResult> {
  public readonly email: string;
  public readonly password: string;
  public readonly ipAddress: string;
  public readonly userAgent: string;

  constructor(props: CommandProps<LoginAuthCommand, LoginAuthCommandResult>) {
    super(props);
    this.email = props.email!;
    this.password = props.password!;
    this.ipAddress = props.ipAddress!;
    this.userAgent = props.userAgent!;
  }
}

export type LoginAuthCommandResult = Result<
  {
    accessToken: string;
    refreshToken: string;
  },
  Error
>;

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler
  implements ICommandHandler<LoginAuthCommand, LoginAuthCommandResult>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly createDeviceService: CreateDeviceService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginAuthCommand) {
    const user = await this.userRepo.findOneByEmail(command.email);
    if (!user) return err(new InvalidCredentialsException());

    const isValid = await this.passwordService.comparePassword(command.password, user.password);
    if (!isValid) return err(new InvalidCredentialsException());

    const refreshTokens = this.tokenService.generateRefreshToken();

    const createDeviceResult = await this.createDeviceService.create({
      userId: user.id,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      hashedRefreshToken: refreshTokens.hashedRefreshToken,
      platform: DEVICE_PLATFORM.WEB,
    });
    if (createDeviceResult.isErr()) return err(createDeviceResult.error);

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      deviceId: createDeviceResult.value.id,
    });

    return ok({
      accessToken,
      refreshToken: refreshTokens.refreshToken,
    });
  }
}
