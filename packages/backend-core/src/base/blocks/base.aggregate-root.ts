import { AbstractAggregateRoot } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseIDomainEvent } from '../messages/base-domain-event';

export abstract class BaseAggregateRoot<TProps> extends AbstractAggregateRoot<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BaseDomainEvent<BaseIDomainEvent<any>>,
  TProps
> {}
