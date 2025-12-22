import { BaseInternalServerException } from '@workspace/backend-ddd';

export class DiscordWebhookUnregisteredException extends BaseInternalServerException<
  'DiscordWebhookUnregistered',
  { webhookName: string }
> {
  readonly code = 'DiscordWebhookUnregistered';

  constructor(webhookName: string) {
    super(`등록되지 않은 디스코드 웹훅입니다: ${webhookName}`, { webhookName }, null);
  }
}

export class InvalidDiscordWebhookUrlException extends BaseInternalServerException<
  'InvalidDiscordWebhookUrl',
  { name: string; url: string }
> {
  readonly code = 'InvalidDiscordWebhookUrl';

  constructor(name: string, url: string) {
    super(`유효하지 않은 디스코드 웹훅 URL입니다: ${url} (${name})`, { name, url }, null);
  }
}
