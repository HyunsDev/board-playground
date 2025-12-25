import { ok } from 'neverthrow';

import { DomainEventsHandler, IDomainEventHandler, MailPublisher } from '@workspace/backend-core';

import { UserPasswordChangedEvent } from '../../domain';

@DomainEventsHandler(UserPasswordChangedEvent)
export class UserPasswordChangedEventHandler implements IDomainEventHandler<UserPasswordChangedEvent> {
  constructor(private readonly mailPublisher: MailPublisher) {}

  async handle(event: UserPasswordChangedEvent) {
    void (await this.mailPublisher.send({
      to: event.data.userEmail,
      subject: '비밀번호가 변경되었습니다',
      html: `<p>안녕하세요,</p>
        <p>최근에 Board Playground의 비밀번호가 변경되었어요.</p>
        <p>만약 직접 변경하지 않았다면, 즉시 비밀번호를 변경해주세요.</p>
        <p>감사합니다.</p>`,
    }));

    return ok(undefined);
  }
}
