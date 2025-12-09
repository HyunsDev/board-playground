import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { TokenProvider } from '@/infra/security/providers/token.provider';
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
    private readonly sessionFacade: SessionFacade,
    private readonly tokenProvider: TokenProvider,
    private readonly userFacade: UserFacade,
  ) {}

  async execute({ data }: IForceLoginCommand) {
    const userResult = await this.userFacade.getOneByEmail(data.email);
    if (userResult.isErr()) {
      return err(userResult.error);
    }
    const user = userResult.value;

    const sessionResult = await this.sessionFacade.create({
      userId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Devtools',
      platform: 'WEB',
    });

    if (sessionResult.isErr()) {
      return err(sessionResult.error);
    }
    const { session, refreshToken } = sessionResult.value;
    const accessToken = this.tokenProvider.generateAccessToken({
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
