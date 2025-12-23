import { Module } from '@nestjs/common';

import { TestJobModule } from './modules/test-job/test-job.module';
import { TestMailModule } from './modules/test-mail/test-mail.module';
import { TestMessagingModule } from './modules/test-messaging/test-messaging.module';
import { TestWebhookModule } from './modules/test-webhook/test-webhook.module';

@Module({
  imports: [TestMessagingModule, TestJobModule, TestWebhookModule, TestMailModule],
  providers: [],
  controllers: [],
})
export class TestModule {}
