import { randomUUID } from 'crypto';

import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CacheService,
  CommandHandler,
  DomainEventPublisherPort,
  ICommandHandler,
  MailPublisher,
  TransactionManager,
} from '@workspace/backend-core';
import { UserEmail } from '@workspace/common';
import { asCommandCode, DomainCodeEnums } from '@workspace/domain';

import { getPasswordResetCodeKey } from '@/domains/auth/auth.utils';
import { ResetEmailSentEvent } from '@/domains/auth/domain/events/reset-email-sent.event';
import { UserLessResetEmailSentEvent } from '@/domains/auth/domain/events/userless-reset-email-sent.event';
import { UserFacade } from '@/domains/user/application/facades/user.facade';

type SendResetEmailCommandProps = BaseCommandProps<{
  email: UserEmail;
}>;

export class SendResetEmailCommand extends BaseCommand<
  SendResetEmailCommandProps,
  void,
  HandlerResult<SendResetEmailCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:send_reset_email');
  readonly resourceType = DomainCodeEnums.Account.Auth;

  constructor(data: SendResetEmailCommandProps['data']) {
    super(null, data);
  }
}

@CommandHandler(SendResetEmailCommand)
export class SendResetEmailCommandHandler implements ICommandHandler<SendResetEmailCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly mailPublisher: MailPublisher,
    private readonly cacheService: CacheService,
    private readonly domainEventPublisher: DomainEventPublisherPort,
    private readonly txManager: TransactionManager,
  ) {}

  async execute({ data }: SendResetEmailCommandProps) {
    return await this.txManager.run(async () => {
      const userExists = await this.userFacade.userEmailExists(data.email);
      if (!userExists) {
        void (await this.domainEventPublisher.publish(
          new UserLessResetEmailSentEvent({ email: data.email }),
        ));
        return ok(undefined);
      }

      const verificationCode = randomUUID();

      void (await this.cacheService.setOrThrow(
        getPasswordResetCodeKey(data.email),
        verificationCode,
        10 * 60, // 10 minutes
      ));

      void (await this.mailPublisher.send({
        to: data.email,
        subject: '[Board Playground] 비밀번호 재설정 코드',
        html: `<p>안녕하세요, Board Playground입니다.</p>
                <p>비밀번호 재설정 코드: <strong>${verificationCode}</strong></p>
                <p>이 코드는 10분 동안 유효합니다.</p>
                <p>요청하지 않은 경우 이 메일을 무시해 주세요.</p>`,
      }));

      void (await this.domainEventPublisher.publish(
        new ResetEmailSentEvent({ email: data.email }),
      ));

      return ok(undefined);
    });
  }
}
