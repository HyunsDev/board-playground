import { BaseInternalServerException } from '@workspace/backend-ddd';

export type UnexpectedDiscordWebhookErrorDetails = {
  status?: number;
  errorBody?: unknown;
};

export class UnexpectedDiscordWebhookErrorException extends BaseInternalServerException<
  'UnexpectedDiscordWebhookError',
  UnexpectedDiscordWebhookErrorDetails
> {
  readonly code = 'UnexpectedDiscordWebhookError';

  constructor(message: string, data: UnexpectedDiscordWebhookErrorDetails, error: unknown) {
    super(message, data, error);
  }
}

export class DiscordWebhookUnregisteredException extends BaseInternalServerException<
  'DiscordWebhookUnregistered',
  { webhookName: string }
> {
  readonly code = 'DiscordWebhookUnregistered';

  constructor(webhookName: string) {
    super(`등록되지 않은 디스코드 웹훅입니다: ${webhookName}`, { webhookName }, null);
  }
}
