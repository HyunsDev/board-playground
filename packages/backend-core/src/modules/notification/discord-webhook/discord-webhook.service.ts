import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { APIEmbed } from 'discord-api-types/v10';

import {
  DiscordWebhookUnregisteredException,
  InvalidDiscordWebhookUrlException,
} from './discord-webhook.exceptions';
import { DiscordWebhookModuleOptions } from './discord-webhook.interface';
import { GetWebhookHttpRequest } from './http-requests/get-webhook.http-request';
import { SendWebhookHttpRequest } from './http-requests/send-webhook.http-request copy';

import { HttpClient } from '@/modules/messaging';

export const WEBHOOK_MODULE_OPTIONS = Symbol('WEBHOOK_MODULE_OPTIONS');

type WebHook = {
  url: string;
  username: string;
  avatarUrl: string;
  channelId: string;
  guildId: string;
};

@Injectable()
export class DiscordWebhookService<TName extends string = string> implements OnModuleInit {
  private readonly webhooks = new Map<TName, WebHook>();
  private readonly logger = new Logger(DiscordWebhookService.name);

  constructor(
    @Inject(WEBHOOK_MODULE_OPTIONS) private readonly options: DiscordWebhookModuleOptions<TName>,
    private readonly httpClient: HttpClient,
  ) {}

  async onModuleInit() {
    if (!this.options.webhooks || this.options.webhooks.length === 0) {
      this.logger.warn('No Discord webhooks configured.');
      return;
    }

    for (const webhookOption of this.options.webhooks) {
      const response = await this.httpClient.request(new GetWebhookHttpRequest(webhookOption.url));

      if (response.isErr()) {
        throw new InvalidDiscordWebhookUrlException(webhookOption.name, webhookOption.url);
      }

      const data = response.value;
      this.webhooks.set(webhookOption.name, {
        url: webhookOption.url,
        username: webhookOption.defaultUsername || data.data.name,
        avatarUrl: webhookOption.defaultAvatarUrl || data.data.avatar_url,
        channelId: data.data.channel_id,
        guildId: data.data.guild_id,
      });
    }
  }

  async send(
    name: TName,
    data: { content?: string; embeds?: APIEmbed[]; username?: string; avatar_url?: string },
  ) {
    const webhook = this.webhooks.get(name);
    if (!webhook) {
      throw new DiscordWebhookUnregisteredException(name);
    }

    return await this.httpClient.request(
      new SendWebhookHttpRequest(webhook.url, {
        content: data.content || '',
        embeds: data.embeds,
        username: data.username || webhook.username,
        avatar_url: data.avatar_url || webhook.avatarUrl,
      }),
    );
  }
}
