import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import {
  AuthTokens,
  AuthTokenService,
} from '@/domains/auth/application/services/auth-token.service';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type ForceRegisterCommandProps = CommandProps<{
  email: string;
  username: string;
  nickname: string;
}>;

export class ForceRegisterCommand extends BaseCommand<
  ForceRegisterCommandProps,
  HandlerResult<ForceRegisterCommandHandler>,
  AuthTokens
> {}

@CommandHandler(ForceRegisterCommand)
export class ForceRegisterCommandHandler implements ICommandHandler<ForceRegisterCommand> {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly userFacade: UserFacade,
  ) {}

  async execute({ data }: ForceRegisterCommandProps) {
    const userResult = await this.userFacade.createUser({
      email: data.email,
      username: data.username,
      nickname: data.nickname,
      password: null,
    });
    if (userResult.isErr()) return err(userResult.error);
    const user = userResult.value;

    const tokensResult = await this.authTokenService.issue({
      user,
      device: {
        ipAddress: '127.0.0.1',
        userAgent: 'Devtools',
        platform: 'WEB',
      },
    });
    return tokensResult.match(
      (data) => ok(data),
      (error) => err(error),
    );
  }
}
