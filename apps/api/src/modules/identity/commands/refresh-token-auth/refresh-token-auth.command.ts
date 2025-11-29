import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { CommandBase } from '@/libs/ddd';
import { TokenService } from '@/modules/security/services/token.service';
import { DeviceRepositoryPort } from '@/modules/device/database/device.repository.port';
import { DEVICE_REPOSITORY } from '@/modules/device/device.di-tokens';
import { InvalidTokenException } from '@/modules/device/domain/device.exceptions';
import { UserRepositoryPort } from '@/modules/user/database/user.repository.port';
import { UserNotFoundException } from '@/modules/user/domain/user.exceptions';
import { USER_REPOSITORY } from '@/modules/user/user.di-tokens';

export class RefreshTokenAuthCommand extends CommandBase<RefreshTokenCommandResult> {
  public readonly refreshToken: string;

  constructor(props: { refreshToken: string }) {
    super(props);
    this.refreshToken = props.refreshToken;
  }
}

export type RefreshTokenCommandResult = Result<
  {
    accessToken: string;
    refreshToken: string;
  },
  Error
>;

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthCommandHandler
  implements ICommandHandler<RefreshTokenAuthCommand, RefreshTokenCommandResult>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshTokenAuthCommand) {
    const hashedRefreshToken = this.tokenService.hashToken(command.refreshToken);

    const device = await this.deviceRepo.findByHashedRefreshToken(hashedRefreshToken);
    if (!device) return err(new InvalidTokenException());

    const user = await this.userRepo.findOneById(device.userId);
    if (!user) return err(new UserNotFoundException());

    const newAccessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      deviceId: device.id,
    });

    const refreshTokens = this.tokenService.generateRefreshToken();

    device.updateRefreshToken(refreshTokens.hashedRefreshToken);
    await this.deviceRepo.update(device);

    return ok({
      accessToken: newAccessToken,
      refreshToken: refreshTokens.refreshToken,
    });
  }
}
