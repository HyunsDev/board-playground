import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionService } from '@/domains/session/application/services/session.service';
import { UserService } from '@/domains/user/application/services/user.service';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';
import { AuthTokens } from '@/shared/types/tokens';

type IForceLoginCommand = ICommand<{
  email: string;
}>;

export class ForceLoginCommand extends BaseCommand<
  IForceLoginCommand,
  HandlerResult<ForceLoginCommandHandler>,
  AuthTokens
> {
  readonly domain = DomainCodes.Devtools;
  readonly code = CommandCodes.Devtools.ForceLogin;
  readonly resourceType = ResourceTypes.User;

  constructor(data: IForceLoginCommand['data'], metadata: IForceLoginCommand['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(ForceLoginCommand)
export class ForceLoginCommandHandler implements ICommandHandler<ForceLoginCommand> {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async execute({ data }: IForceLoginCommand) {
    const userResult = await this.userService.getOneByEmail(data.email);
    if (userResult.isErr()) {
      return err(userResult.error);
    }
    const user = userResult.value;

    const sessionResult = await this.sessionService.create({
      userId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Devtools',
      platform: 'WEB',
    });

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }
    const { session, refreshToken } = sessionResult.value;
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      sessionId: session.id,
      email: user.email,
      role: user.role,
    });

    return ok({
      accessToken,
      refreshToken,
    });
  }
}
