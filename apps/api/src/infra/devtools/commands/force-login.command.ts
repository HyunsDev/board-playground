import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionService } from '@/domains/session/application/services/session.service';
import { UserService } from '@/domains/user/application/services/user.service';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { AuthTokens } from '@/shared/types/tokens';

type ForceLoginCommandProps = CommandProps<{
  email: string;
}>;

export class ForceLoginCommand extends BaseCommand<
  ForceLoginCommandProps,
  HandlerResult<ForceLoginCommandHandler>,
  AuthTokens
> {}

@CommandHandler(ForceLoginCommand)
export class ForceLoginCommandHandler implements ICommandHandler<ForceLoginCommand> {
  constructor(
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async execute({ data }: ForceLoginCommandProps) {
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
