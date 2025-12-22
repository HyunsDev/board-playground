import { Module } from '@nestjs/common';

import { DiscordWebhookModule } from '@workspace/backend-core';

import { TestWebhookController } from './test-webhook.controller';
import { TestWebhookName } from './test-webhook.types';

import { DiscordWebhookConfig, discordWebhookConfig } from '@/core/configs';

@Module({
  imports: [
    DiscordWebhookModule.forAsync({
      inject: [discordWebhookConfig.KEY],
      useFactory: (config: DiscordWebhookConfig) => ({
        webhooks: {
          [TestWebhookName]: {
            url: config.discordWebhookUrlTest,
          },
        },
      }),
    }),
  ],
  controllers: [TestWebhookController],
})
export class TestWebhookModule {}
