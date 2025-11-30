import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DeviceRepositoryPort } from '@/domains/device/database/device.repository.port';
import { DEVICE_REPOSITORY } from '@/domains/device/device.di-tokens';
import { InvalidTokenError } from '@/domains/device/domain/device.errors';
import { UserNotFoundError } from '@/domains/user/domain/user.errors';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class RefreshTokenAuthCommand extends CommandBase<RefreshTokenCommandResult> {
  public readonly refreshToken: string;

  constructor(props: { refreshToken: string }) {
    super(props);
    this.refreshToken = props.refreshToken;
  }
}

export type RefreshTokenCommandResult = DomainResult<
  {
    accessToken: string;
    refreshToken: string;
  },
  InvalidTokenError | UserNotFoundError
>;

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthCommandHandler
  implements ICommandHandler<RefreshTokenAuthCommand, RefreshTokenCommandResult>
{
  constructor(
    private readonly userFacade: UserFacade,
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshTokenAuthCommand) {
    const hashedRefreshToken = this.tokenService.hashToken(command.refreshToken);

    const device = await this.deviceRepo.findByHashedRefreshToken(hashedRefreshToken);
    if (!device) return err(new InvalidTokenError());

    const user = await this.userFacade.findOneById(device.userId);
    if (!user) return err(new UserNotFoundError());

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
