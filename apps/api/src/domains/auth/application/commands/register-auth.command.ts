import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { DEVICE_PLATFORM } from '@workspace/contract';

import { SessionService } from '@/domains/session/application/services/session.service';
import { UserService } from '@/domains/user/application/services/user.service';
import { UserPasswordVO } from '@/domains/user/domain/user-password.vo';
import { TransactionManager } from '@/infra/database/transaction.manager';
import { TokenService } from '@/infra/security/services/token.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { AuthTokens } from '@/shared/types/tokens';

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
  AuthTokens
> {}

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, HandlerResult<RegisterAuthCommandHandler>>
{
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: RegisterAuthCommandProps) {
    return await this.txManager.run(async () => {
      const hashedPasswordResult = await UserPasswordVO.create(data.password);
      if (hashedPasswordResult.isErr()) {
        return err(hashedPasswordResult.error);
      }
      const hashedPassword = hashedPasswordResult.value;

      const createUserResult = await this.userService.create({
        email: data.email,
        username: data.username,
        nickname: data.nickname,
        password: hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      const sessionResult = await this.sessionService.create({
        userId: createUserResult.value.id,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (sessionResult.isErr()) {
        return err(sessionResult.error);
      }
      const { session, refreshToken } = sessionResult.value;

      const accessToken = await this.tokenService.generateAccessToken({
        sub: createUserResult.value.id,
        sessionId: session.id,
        email: createUserResult.value.email,
        role: createUserResult.value.role,
      });
      return ok({
        accessToken,
        refreshToken,
      });
    });
  }
}
