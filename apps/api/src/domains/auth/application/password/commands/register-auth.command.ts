import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  AccessTokenProvider,
  CommandHandler,
  DrivenMessageMetadata,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { ValidationError } from '@workspace/backend-ddd';
import { DEVICE_PLATFORM, passwordSchema } from '@workspace/contract';
import { UserEmail, Username } from '@workspace/domain';
import { AggregateCodeEnum, asCommandCode, EmailVerificationCode } from '@workspace/domain';

import { InvalidEmailVerificationCodeError } from '@/domains/auth/auth.domain-error';
import { EmailVerificationCodeStorePort } from '@/domains/auth/domain/email-verification-code.store.port';
import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { PasswordProvider } from '@/infra/crypto';
import { AuthTokens } from '@/shared/types/tokens';

type IRegisterAuthCommand = BaseCommandProps<{
  email: UserEmail;
  username: Username;
  nickname: string;
  password: string;
  ipAddress: string;
  userAgent: string;
  emailVerificationCode: EmailVerificationCode;
}>;

export class RegisterAuthCommand extends BaseCommand<
  IRegisterAuthCommand,
  AuthTokens,
  HandlerResult<RegisterAuthCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:register');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IRegisterAuthCommand['data'], metadata?: DrivenMessageMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(RegisterAuthCommand)
export class RegisterAuthCommandHandler implements ICommandHandler<RegisterAuthCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly accessTokenProvider: AccessTokenProvider,
    private readonly passwordProvider: PasswordProvider,
    private readonly txManager: TransactionManager,
    private readonly emailVerificationCodeStore: EmailVerificationCodeStorePort,
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

      const verifyResult = await this.emailVerificationCodeStore.verifyAndConsume(
        command.data.email,
        command.data.emailVerificationCode,
      );
      if (verifyResult.isErr() || !verifyResult.value) {
        return err(new InvalidEmailVerificationCodeError());
      }

      // 사용자 생성 로직
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

      const accessToken = this.accessTokenProvider.generateAccessToken({
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
