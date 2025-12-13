import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { CausationCode, DomainCode } from '@workspace/domain';

export type MessageMetadata = AbstractMessageMetadata<CausationCode, DomainCode>;

export type CreateMessageMetadata = AbstractCreateMessageMetadata<CausationCode, DomainCode>;
