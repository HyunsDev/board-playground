import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

import { BaseIDomainEvent, BaseDomainEvent } from '@/shared/base';

export type IUserNameChangedEvent = BaseIDomainEvent<{
  userId: string;
  oldUsername: string;
  newUsername: string;
}>;

export class UserUsernameChangedEvent extends BaseDomainEvent<IUserNameChangedEvent> {
  readonly code = defineEventCode('account:user:evt:username_changed');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUserNameChangedEvent['data'], metadata?: IUserNameChangedEvent['metadata']) {
    super(data.userId, data, metadata);
  }
}
