import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { CreateDeviceService } from '@/domains/device/services/create-device.service';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { InvalidCredentialsException } from '@/infra/security/domain/security.exceptions';
import { PasswordService } from '@/infra/security/services/password.service';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase, CommandProps } from '@/shared/ddd';

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
    private readonly userFacade: UserFacade,
    private readonly createDeviceService: CreateDeviceService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginAuthCommand) {
    const user = await this.userFacade.findOneByEmail(command.email);
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
