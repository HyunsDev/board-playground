import { Inject, Injectable, Logger } from '@nestjs/common';

import { DomainCodeEnums } from '@workspace/domain';

import { DiscordWebhookUnregisteredException } from './discord-webhook.exceptions';
import { DiscordWebhookModuleOptions, WebhookOption } from './discord-webhook.interface';
import { WebhookClient } from './webhook.client';

import { systemLog, SystemLogActionEnum } from '@/modules/observability/logging';

export const WEBHOOK_MODULE_OPTIONS = Symbol('WEBHOOK_MODULE_OPTIONS');

@Injectable()
export class DiscordWebhookService {
  private readonly clients = new Map<string, WebhookClient>();
  private readonly logger = new Logger(DiscordWebhookService.name);

  constructor(@Inject(WEBHOOK_MODULE_OPTIONS) options: DiscordWebhookModuleOptions) {
    if (!options.webhooks || options.webhooks.length === 0) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Notification, SystemLogActionEnum.AppInitialize, {
          msg: 'No Discord webhooks configured.',
        }),
      );
    }

    options.webhooks.forEach((webhook: WebhookOption) => {
      this.clients.set(
        webhook.name,
        new WebhookClient(webhook.url, webhook.defaultUsername, webhook.defaultAvatarUrl),
      );
    });
  }

  get(name: string): WebhookClient {
    const client = this.clients.get(name);
    if (!client) {
      throw new DiscordWebhookUnregisteredException(name);
    }
    return client;
  }
}
