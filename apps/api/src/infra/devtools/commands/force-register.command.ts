import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { TokenProvider } from '@/infra/security/providers/token.provider';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
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
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async execute({ data }: ForceRegisterCommandProps) {
    const createUserResult = await this.userFacade.create({
      email: data.email,
      username: data.username,
      nickname: data.nickname,
      hashedPassword: null,
    });
    if (createUserResult.isErr()) return err(createUserResult.error);
    const user = createUserResult.value;

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
