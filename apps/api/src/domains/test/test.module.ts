import { Module } from '@nestjs/common';

import { TestMessagingModule } from './modules/test-messaging/test-messaging.module';

@Module({
  imports: [TestMessagingModule],
  providers: [],
  controllers: [],
})
export class TestModule {}
