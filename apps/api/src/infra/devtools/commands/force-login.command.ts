import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import {
  AuthTokens,
  AuthTokenService,
} from '@/domains/auth/application/services/auth-token.service';
import { UserFacade } from '@/domains/user/interface/user.facade';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type ForceLoginCommandProps = CommandProps<{
  userId: string;
}>;

export class ForceLoginCommand extends BaseCommand<
  ForceLoginCommandProps,
  HandlerResult<ForceLoginCommandHandler>,
  AuthTokens
> {}

@CommandHandler(ForceLoginCommand)
export class ForceLoginCommandHandler implements ICommandHandler<ForceLoginCommand> {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly userFacade: UserFacade,
  ) {}

  async execute({ data }: ForceLoginCommandProps) {
    const userResult = await this.userFacade.getOneById(data.userId);
    if (userResult.isErr()) {
      return err(userResult.error);
    }
    const user = userResult.value;

    return (
      await this.authTokenService.issue({
        user,
        device: {
          ipAddress: '127.0.0.1',
          userAgent: 'Devtools',
          platform: 'WEB',
        },
      })
    ).match(
      (tokens) => ok(tokens),
      (error) => err(error),
    );
  }
}
