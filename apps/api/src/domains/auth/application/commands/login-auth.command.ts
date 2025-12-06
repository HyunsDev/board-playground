import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { AuthTokens, AuthTokenService } from '../services/auth-token.service';

import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { InvalidCredentialsError } from '@/infra/security/domain/security.domain-errors';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type LoginAuthCommandProps = CommandProps<{
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class LoginAuthCommand extends BaseCommand<
  LoginAuthCommandProps,
  HandlerResult<LoginAuthCommandHandler>,
  AuthTokens
> {}

@CommandHandler(LoginAuthCommand)
export class LoginAuthCommandHandler implements ICommandHandler<LoginAuthCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly authTokenService: AuthTokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: LoginAuthCommandProps) {
    return await this.txManager.run(async () => {
      const userResult = await this.userFacade.getOneByEmail(data.email);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }
      const user = userResult.value;

      const isValid = await user.password.compare(data.password);
      if (isValid.isErr()) {
        return matchError(isValid.error, {
          InvalidCredentials: (e) => err(e),
        });
      }

      const tokensResult = await this.authTokenService.issue({
        user,
        device: {
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          platform: DEVICE_PLATFORM.WEB,
        },
      });
      return tokensResult.match(
        (tokens) => ok(tokens),
        (error) => err(error),
      );
    });
  }
}
