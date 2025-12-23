import { Module } from '@nestjs/common';

import { MailerModule } from '@workspace/backend-core';

import { TestMailController } from './test-mail.controller';

@Module({
  imports: [MailerModule.forFeature()],
  controllers: [TestMailController],
})
export class TestMailModule {}
