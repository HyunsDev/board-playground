import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { DEVICE_PLATFORM, passwordSchema } from '@workspace/contract';

import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { TransactionManager } from '@/infra/prisma/transaction.manager';
import { PasswordProvider } from '@/infra/security/providers/password.provider';
import { TokenProvider } from '@/infra/security/providers/token.provider';
import { BaseCommand, ICommand, ValidationError } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { AuthTokens } from '@/shared/types/tokens';

type IRegisterAuthCommand = ICommand<{
  email: string;
  username: string;
  nickname: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}>;

export class RegisterAuthCommand extends BaseCommand<
  IRegisterAuthCommand,
  HandlerResult<RegisterAuthCommandHandler>,
  AuthTokens
> {
  readonly code = CommandCodes.Auth.Register;
  readonly resourceType = ResourceTypes.User;

  constructor(data: IRegisterAuthCommand['data'], metadata: IRegisterAuthCommand['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler
  implements ICommandHandler<RegisterAuthCommand, HandlerResult<RegisterAuthCommandHandler>>
{
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordProvider: PasswordProvider,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: IRegisterAuthCommand) {
    return await this.txManager.run(async () => {
      const passwordValidation = passwordSchema.safeParse(command.data.password);
      if (!passwordValidation.success) {
        return err(
          new ValidationError({
            body: passwordValidation.error.issues,
            query: null,
            pathParams: null,
            headers: null,
          }),
        );
      }

      const hashedPassword = await this.passwordProvider.hash(passwordValidation.data);
      const createUserResult = await this.userFacade.create({
        email: command.data.email,
        username: command.data.username,
        nickname: command.data.nickname,
        hashedPassword,
      });
      if (createUserResult.isErr()) return err(createUserResult.error);

      const sessionResult = await this.sessionFacade.create({
        userId: createUserResult.value.id,
        userAgent: command.data.userAgent,
        ipAddress: command.data.ipAddress,
        platform: DEVICE_PLATFORM.WEB,
      });
      if (sessionResult.isErr()) {
        return err(sessionResult.error);
      }
      const { session, refreshToken } = sessionResult.value;

      const accessToken = await this.tokenProvider.generateAccessToken({
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
