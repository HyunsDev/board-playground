import { AbstractAggregateRoot } from '@workspace/backend-ddd';
import { ModelId } from '@workspace/domain';

import { BaseDomainEvent, BaseDomainEventProps } from '../messages/messages/base.domain-event';

export abstract class BaseAggregateRoot<TProps, TId extends ModelId> extends AbstractAggregateRoot<
  TProps,
  TId,
  BaseDomainEvent<BaseDomainEventProps<unknown>>
> {}
