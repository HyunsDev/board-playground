import { asHttpRequestCode, DomainCodeEnums } from '@workspace/domain';

import { BaseHttpRequest, BaseHttpRequestProps } from '@/base';

export type GetWebhookHttpRequestProps = BaseHttpRequestProps<{
  url: string;
  method: 'GET';
}>;
export class GetWebhookHttpRequest extends BaseHttpRequest<
  GetWebhookHttpRequestProps,
  {
    status: 200;
    data: {
      channel_id: string;
      guild_id: string;
      id: string;
      name: string;
      avatar: string | null;
    };
  }
> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asHttpRequestCode('system:notification:web:get_webhook');

  constructor(url: string) {
    super({ url, method: 'GET' });
  }
}
