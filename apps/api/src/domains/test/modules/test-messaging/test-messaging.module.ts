import { Module } from '@nestjs/common';

import { TestController } from './test-messaging.controller';

@Module({
  providers: [],
  controllers: [TestController],
})
export class TestMessagingModule {}
