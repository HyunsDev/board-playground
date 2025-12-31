import { ok, ResultAsync } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  DomainEventPublisherPort,
  ICommandHandler,
  MailPublisher,
  TransactionManager,
} from '@workspace/backend-core';
import { UserEmail } from '@workspace/domain';
import { asCommandCode, DomainCodeEnums } from '@workspace/domain';

import { EmailVerificationCodeStorePort } from '@/domains/auth/domain/email-verification-code.store.port';
import { EmailVerificationSentEvent } from '@/domains/auth/domain/events/email-verification-sent.event';
import { UserFacade } from '@/domains/user/application/facades/user.facade';

type sendVerificationEmailProps = BaseCommandProps<{
  email: UserEmail;
}>;

export class SendVerificationEmailCommand extends BaseCommand<
  sendVerificationEmailProps,
  void,
  HandlerResult<SendVerificationEmailCommandHandler>
> {
  static readonly code = asCommandCode('account:auth:cmd:send_verification_email');
  readonly resourceType = DomainCodeEnums.Account.Auth;

  constructor(data: sendVerificationEmailProps['data']) {
    super(null, data);
  }
}

@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailCommandHandler implements ICommandHandler<SendVerificationEmailCommand> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly txManager: TransactionManager,
    private readonly mailPublisher: MailPublisher,
    private readonly domainEventPublisher: DomainEventPublisherPort,
    private readonly emailVerificationCodeStore: EmailVerificationCodeStorePort,
  ) {}

  async execute(command: sendVerificationEmailProps) {
    return await this.txManager.run(async () => {
      const userExists = await this.userFacade.userEmailExists(command.data.email);

      if (userExists) {
        void (await this.mailPublisher.send({
          to: command.data.email,
          subject: '[Board Playground] 이미 계정이 존재합니다',
          html: `<p>안녕하세요, Board Playground입니다.</p>
                    <p>입력하신 이메일 주소는 이미 계정이 존재합니다. 다른 이메일 주소를 사용해 주세요.</p>
                    <p>누군가 실수로 입력한 것일 수 있습니다.</p>
                    <p>감사합니다.</p>`,
        }));
        return ok(undefined);
      }

      return await this.emailVerificationCodeStore
        .generate(command.data.email, 10 * 60)
        .andThrough((verificationCode) =>
          ResultAsync.fromSafePromise(
            this.mailPublisher.send({
              to: command.data.email,
              subject: '[Board Playground] 이메일 인증 코드',
              html: `<p>안녕하세요, Board Playground입니다.</p>
                  <p>이메일 인증 코드는 <strong>${verificationCode}</strong> 입니다.</p>
                  <p>이 코드는 10분 동안 유효합니다.</p>
                  <p>감사합니다.</p>`,
            }),
          ),
        )
        .andThrough(() =>
          ResultAsync.fromSafePromise(
            this.domainEventPublisher.publish(
              new EmailVerificationSentEvent({
                email: command.data.email,
              }),
            ),
          ),
        )
        .map(() => undefined);
    });
  }
}
