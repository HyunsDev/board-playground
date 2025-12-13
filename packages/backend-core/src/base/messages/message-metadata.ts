import { AbstractDrivenMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { CausationCode, DomainCode } from '@workspace/domain';

export type MessageMetadata = AbstractMessageMetadata<CausationCode, DomainCode>;

export type CreateMessageMetadata = AbstractDrivenMessageMetadata<CausationCode, DomainCode>;

export type DeriveMetadata = AbstractDrivenMessageMetadata<CausationCode, DomainCode>;
