import { TriggerCode } from '@workspace/backend-core';
import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { CommandCode, EventCode } from '@workspace/domain';

export type MessageMetadata = AbstractMessageMetadata<
  CommandCode<string> | TriggerCode | EventCode<string>
>;

export type CreateMessageMetadata = AbstractCreateMessageMetadata<
  CommandCode<string> | TriggerCode | EventCode<string>
>;
