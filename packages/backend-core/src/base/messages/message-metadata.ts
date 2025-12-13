import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { CommandCode, EventCode } from '@workspace/domain';

import { TriggerCode } from '@/common';

export type MessageMetadata = AbstractMessageMetadata<
  CommandCode<string> | TriggerCode | EventCode<string>
>;

export type CreateMessageMetadata = AbstractCreateMessageMetadata<
  CommandCode<string> | TriggerCode | EventCode<string>
>;
