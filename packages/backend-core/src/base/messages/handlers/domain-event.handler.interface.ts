import { MessageResult } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseDomainEventProps } from '../messages';

export interface IDomainEventHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEvent extends BaseDomainEvent<BaseDomainEventProps<any>>,
> {
  handle(event: TEvent): MessageResult<TEvent>;
}
