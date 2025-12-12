import { AbstractAggregateRoot } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseIDomainEvent } from '../cqrs/base-domain-event';

export abstract class BaseAggregateRoot<TProps> extends AbstractAggregateRoot<
  BaseDomainEvent<BaseIDomainEvent<unknown>>,
  TProps
> {}
