import {
  APIAllowedMentions,
  APIEmbed,
  RESTPostAPIWebhookWithTokenJSONBody,
} from 'discord-api-types/v10';

import { UnexpectedDiscordWebhookErrorException } from './discord-webhook.exceptions';

interface WebhookErrorResponse {
  code?: number;
  message?: string;
}

export class WebhookClient {
  private readonly url: string;
  private readonly defaultUsername?: string;
  private readonly defaultAvatarUrl?: string;

  constructor(url: string, defaultUsername?: string, defaultAvatarUrl?: string) {
    if (!url) {
      throw new Error('Webhook URL is required');
    }
    this.url = url;
    this.defaultUsername = defaultUsername;
    this.defaultAvatarUrl = defaultAvatarUrl;
  }

  async get() {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      await this.handleError(res);
    }

    return await res.json();
  }

  async send(
    content: string,
    options: {
      embeds?: APIEmbed[];
      allowedMentions?: APIAllowedMentions;
      username?: string;
      avatarUrl?: string;
    } = {},
  ) {
    const payload: RESTPostAPIWebhookWithTokenJSONBody = {
      content: content,
      username: options.username || this.defaultUsername,
      avatar_url: options.avatarUrl || this.defaultAvatarUrl,
      tts: false,
      embeds: options.embeds || [],
      allowed_mentions: options.allowedMentions || {},
    };

    try {
      const res = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        await this.handleError(res);
      }

      // 디스코드 웹훅은 기본적으로 204 No Content를 반환할 수 있으므로,
      // JSON 파싱 에러를 방지하기 위해 컨텐츠가 있을 때만 파싱합니다.
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return true;
    } catch (err) {
      if (err instanceof UnexpectedDiscordWebhookErrorException) {
        throw err;
      }
      throw new UnexpectedDiscordWebhookErrorException(
        '디스코드 웹훅 전송 중 알 수 없는 오류가 발생했습니다.',
        {},
        err,
      );
    }
  }

  private async handleError(res: Response): Promise<never> {
    let errorBody: WebhookErrorResponse = {};
    try {
      errorBody = (await res.json()) as WebhookErrorResponse;
    } catch {
      errorBody = { message: res.statusText };
    }

    const errorMessage = errorBody.message
      ? `Discord API Error: ${errorBody.message}`
      : `HTTP Error ${res.status}`;

    throw new UnexpectedDiscordWebhookErrorException(
      errorMessage,
      { status: res.status, errorBody },
      null,
    );
  }
}
