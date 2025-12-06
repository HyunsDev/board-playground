import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { AuthTokenService } from '../services/auth-token.service';

import { UserFacade } from '@/domains/user/interface/user.facade';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { PasswordService } from '@/infra/security/services/password.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type RegisterAuthCommandProps = CommandProps<{
  email: string;
  username: string;
  nickname: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class RegisterAuthCommand extends BaseCommand<
  RegisterAuthCommandProps,
  HandlerResult<RegisterAuthCommandHandler>,
  {
    accessToken: string;
    refreshToken: string;
  }
> {}

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, HandlerResult<RegisterAuthCommandHandler>>
{
  constructor(
    private readonly userFacade: UserFacade,
    private readonly passwordService: PasswordService,
    private readonly txManager: TransactionManager,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute({ data }: RegisterAuthCommandProps) {
    return await this.txManager.run(async () => {
      const hashedPassword = await this.passwordService.hashPassword(data.password);

      const createUserResult = await this.userFacade.createUser({
        email: data.email,
        username: data.username,
        nickname: data.nickname,
        password: hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      return (
        await this.authTokenService.issue({
          user: createUserResult.value,
          device: {
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            platform: DEVICE_PLATFORM.WEB,
          },
        })
      ).match(
        (tokens) => ok(tokens),
        (error) => err(error),
      );
    });
  }
}
