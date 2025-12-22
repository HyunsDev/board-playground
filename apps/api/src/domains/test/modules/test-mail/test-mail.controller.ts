import { Controller, Get, Logger } from '@nestjs/common';

import { MailPublisher, Public, Trigger } from '@workspace/backend-core';
import { TriggerCodeEnum } from '@workspace/domain';

@Public()
@Controller('_test')
export class TestMailController {
  readonly logger = new Logger(TestMailController.name);

  constructor(private readonly mailPublisher: MailPublisher) {}

  @Get('mail')
  @Trigger(TriggerCodeEnum.Http)
  async mail() {
    return await this.mailPublisher.send({
      to: 'phw3071@gmail.com',
      subject: '테스트 메일입니다.',
      html: '<h1>이것은 테스트 메일의 본문입니다.</h1>',
    });
  }
}
