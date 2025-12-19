import { AbstractDrivenMessageMetadata, AbstractMessageMetadata } from '@workspace/backend-ddd';
import { CausationCode, DomainCode } from '@workspace/domain';

export type MessageMetadata = AbstractMessageMetadata<CausationCode, DomainCode>;

export type DrivenMessageMetadata = AbstractDrivenMessageMetadata<CausationCode, DomainCode>;
