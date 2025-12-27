import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { matchError, ValidationError } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { passwordSchema } from '@workspace/contract';
import { AggregateCodeEnum, asCommandCode, SessionId } from '@workspace/domain';

import { InvalidCredentialsError } from '@/domains/auth/auth.domain-error';
import { SessionFacade } from '@/domains/session/application/facades/session.facade';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { UserNotFoundError } from '@/domains/user/domain/user.domain-errors';
import { PasswordProvider } from '@/infra/crypto';

type ChangePasswordCommandProps = BaseCommandProps<{
  userId: UserId;
  oldPassword?: string;
  newPassword: string;
  logoutAllSessions: boolean;
  currentSessionId: SessionId;
}>;

export class ChangePasswordCommand extends BaseCommand<
  ChangePasswordCommandProps,
  void,
  HandlerResult<ChangePasswordCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:change_password');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ChangePasswordCommandProps['data']) {
    super(data.userId, data);
  }
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly sessionFacade: SessionFacade,
    private readonly txManager: TransactionManager,
    private readonly passwordProvider: PasswordProvider,
  ) {}

  async execute({ data }: ChangePasswordCommandProps) {
    return await this.txManager.run(async () => {
      // 유저 조회
      const userResult = await this.userFacade.getOneById(data.userId);
      if (userResult.isErr())
        return matchError(userResult.error, {
          UserNotFound: () => err(new UserNotFoundError()),
        });
      const user = userResult.value;

      // 비밀번호 유효성 검사
      const passwordValidation = passwordSchema.safeParse(data.newPassword);
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

      // 기존 비밀번호 확인, 기존 비밀번호가 없을 경우(신규 비밀번호 설정 등) oldPassword 체크 안함
      if (user.password) {
        if (!data.oldPassword) return err(new InvalidCredentialsError());

        const isPasswordValid = await this.passwordProvider.compare(
          data.oldPassword,
          user.password.hashedValue,
        );
        if (!isPasswordValid) return err(new InvalidCredentialsError());
      }

      // 비밀번호 변경
      const newHashedPassword = await this.passwordProvider.hash(passwordValidation.data);
      const updateResult = await this.userFacade.updatePassword(user.id, newHashedPassword);
      if (updateResult.isErr())
        return matchError(updateResult.error, {
          UserNotFound: () => err(new UserNotFoundError()),
        });

      // 세션 종료
      if (data.logoutAllSessions) {
        const closeAllResult = await this.sessionFacade.closeAllActives(
          user.id,
          data.currentSessionId,
        );
        if (closeAllResult.isErr()) return matchError(closeAllResult.error, {});
      }

      return ok(undefined);
    });
  }
}
