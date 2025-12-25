import { APIEmbed } from 'discord-api-types/v10';

import { asHttpRequestCode, DomainCodeEnums } from '@workspace/domain';

import { BaseHttpRequest, BaseHttpRequestProps } from '@/base';

type SendWebhookHttpRequestProps = BaseHttpRequestProps<{
  url: string;
  data: {
    content: string;
    username?: string;
    avatar_url?: string;
    embeds?: APIEmbed[];
    tts: false;
    allowed_mentions?: object;
  };
  method: 'POST';
}>;
export class SendWebhookHttpRequest extends BaseHttpRequest<
  SendWebhookHttpRequestProps,
  {
    status: 204;
    data: '';
  }
> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asHttpRequestCode('system:notification:web:send_webhook');

  constructor(
    url: string,
    data: {
      content: string;
      embeds?: APIEmbed[];
      username?: string;
      avatar_url?: string;
    },
  ) {
    super(null, {
      url,
      method: 'POST',
      data: {
        content: data.content,
        username: data.username,
        avatar_url: data.avatar_url,
        embeds: data.embeds,
        tts: false,
        allowed_mentions: {},
      },
    });
  }
}
