import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { DeviceRepositoryPort } from '@/domains/device/database/device.repository.port';
import { DEVICE_REPOSITORY } from '@/domains/device/device.di-tokens';
import { TokenService } from '@/infra/security/services/token.service';
import { CommandBase } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

export class LogoutAuthCommand extends CommandBase<LogoutAuthCommandResult> {
  public readonly refreshToken: string;

  constructor(props: { refreshToken: string }) {
    super(props);
    this.refreshToken = props.refreshToken;
  }
}
export type LogoutAuthCommandResult = DomainResult<null, never>;

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

    const device = await this.deviceRepo.findByHashedRefreshToken(hashedRefreshToken);
    if (device) await this.deviceRepo.delete(device);

    return ok(null);
  }
}
