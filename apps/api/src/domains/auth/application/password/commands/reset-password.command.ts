import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  DomainEventPublisherPort,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { matchError, ValidationError } from '@workspace/backend-ddd';
import { UserEmail } from '@workspace/common';
import { passwordSchema } from '@workspace/contract';
import { AggregateCodeEnum, asCommandCode, PasswordResetCode } from '@workspace/domain';

import { InvalidCredentialsError } from '@/domains/auth/auth.domain-error';
import { PasswordResetEvent } from '@/domains/auth/domain/events/password-reset.event';
import { PasswordResetCodeStorePort } from '@/domains/auth/domain/password-reset-code.store.port';
import { UserFacade } from '@/domains/user/application/facades/user.facade';
import { PasswordProvider } from '@/infra/crypto';

type ResetPasswordCommandProps = BaseCommandProps<{
  email: UserEmail;
  newPassword: string;
  passwordResetCode: PasswordResetCode;
}>;

export class ResetPasswordCommand extends BaseCommand<
  ResetPasswordCommandProps,
  void,
  HandlerResult<ResetPasswordCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:reset_password');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ResetPasswordCommandProps['data']) {
    super(null, data);
  }
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly passwordProvider: PasswordProvider,
    private readonly txManager: TransactionManager,
    private readonly domainEventPublisher: DomainEventPublisherPort,
    private readonly passwordResetCodeStore: PasswordResetCodeStorePort,
  ) {}

  async execute({ data }: ResetPasswordCommandProps) {
    return await this.txManager.run(async () => {
      const verifyResult = await this.passwordResetCodeStore.verifyAndConsume(
        data.email,
        data.passwordResetCode,
      );
      if (verifyResult.isErr() || !verifyResult.value) {
        return err(new InvalidCredentialsError());
      }

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

      const userResult = await this.userFacade.getOneByEmail(data.email);
      if (userResult.isErr()) {
        return matchError(userResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }
      const user = userResult.value;

      const hashedPassword = await this.passwordProvider.hash(passwordValidation.data);
      const updateResult = await this.userFacade.updatePassword(user.id, hashedPassword);
      if (updateResult.isErr()) {
        return matchError(updateResult.error, {
          UserNotFound: () => err(new InvalidCredentialsError()),
        });
      }

      void (await this.domainEventPublisher.publish(
        new PasswordResetEvent({
          userId: user.id,
        }),
      ));

      return ok(undefined);
    });
  }
}
