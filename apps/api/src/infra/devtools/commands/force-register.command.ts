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

type ForceRegisterCommandProps = ICommand<{
  email: string;
  username: string;
  nickname: string;
}>;

export class ForceRegisterCommand extends BaseCommand<
  ForceRegisterCommandProps,
  HandlerResult<ForceRegisterCommandHandler>,
  AuthTokens
> {
  readonly domain = DomainCodes.Devtools;
  readonly code = CommandCodes.Devtools.ForceRegister;
  readonly resourceType = ResourceTypes.User;

  constructor(
    data: ForceRegisterCommandProps['data'],
    metadata: ForceRegisterCommandProps['metadata'],
  ) {
    super(null, data, metadata);
  }
}

@CommandHandler(ForceRegisterCommand)
export class ForceRegisterCommandHandler implements ICommandHandler<ForceRegisterCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  async execute({ data }: ForceRegisterCommandProps) {
    const createUserResult = await this.userService.create({
      email: data.email,
      username: data.username,
      nickname: data.nickname,
      password: null,
    });
    if (createUserResult.isErr()) return err(createUserResult.error);
    const user = createUserResult.value;

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
