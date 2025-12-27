import { MessageResult } from '@workspace/backend-ddd';

import { BaseDomainEvent, BaseDomainEventProps } from '..';

export interface IDomainEventHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEvent extends BaseDomainEvent<BaseDomainEventProps<any>>,
> {
  handle(event: TEvent): Promise<MessageResult<TEvent>>;
}
