import { Controller, Get, Logger } from '@nestjs/common';

import { DiscordWebhookService, Public } from '@workspace/backend-core';

import { TestWebhookName } from './test-webhook.types';

@Public()
@Controller('_test')
export class TestWebhookController {
  readonly logger = new Logger(TestWebhookController.name);
  constructor(private readonly discordWebhook: DiscordWebhookService) {}

  @Get('webhook')
  async sendDiscordWebhookTest() {
    return await this.discordWebhook.send(TestWebhookName, {
      content: 'Hello, World!',
    });
  }
}
