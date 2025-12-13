import { AbstractAggregateRoot } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseDomainEventProps } from '../messages/base-domain-event';

export abstract class BaseAggregateRoot<TProps> extends AbstractAggregateRoot<
  BaseDomainEvent<BaseDomainEventProps<unknown>>,
  TProps
> {}
