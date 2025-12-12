import { AbstractAggregateRoot } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseIDomainEvent } from '../cqrs/base-domain-event';

export abstract class BaseAggregateRoot<
  TDomainEvent extends BaseDomainEvent<BaseIDomainEvent<unknown>>,
  TProps,
> extends AbstractAggregateRoot<TDomainEvent, TProps> {}
