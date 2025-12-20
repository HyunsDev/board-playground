import { Module } from '@nestjs/common';

import { TestJobModule } from './modules/test-job/test-job.module';
import { TestMessagingModule } from './modules/test-messaging/test-messaging.module';

@Module({
  imports: [TestMessagingModule, TestJobModule],
  providers: [],
  controllers: [],
})
export class TestModule {}
