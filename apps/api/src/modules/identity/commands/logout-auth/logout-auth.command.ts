import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok, Result } from 'neverthrow';

import { CommandBase } from '@/libs/ddd';
import { TokenService } from '@/modules/auth/services/token.service';
import { DeviceRepositoryPort } from '@/modules/device/database/device.repository.port';
import { DEVICE_REPOSITORY } from '@/modules/device/device.di-tokens';

export class LogoutAuthCommand extends CommandBase<LogoutAuthCommandResult> {
  public readonly userId: string;
  public readonly refreshToken: string;

  constructor(props: { userId: string; refreshToken: string }) {
    super(props);
    this.userId = props.userId;
    this.refreshToken = props.refreshToken;
  }
}
export type LogoutAuthCommandResult = Result<null, Error>;

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthCommandHandler
  implements ICommandHandler<LogoutAuthCommand, LogoutAuthCommandResult>
{
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepo: DeviceRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutAuthCommand) {
    const hashedRefreshToken = this.tokenService.hashToken(command.refreshToken);

    const device = await this.deviceRepo.findByUserIdAndHashedRefreshToken(
      command.userId,
      hashedRefreshToken,
    );
    if (device) await this.deviceRepo.delete(device);

    return ok(null);
  }
}
