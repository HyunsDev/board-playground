import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type IUserNameChangedEvent = BaseDomainEventProps<{
  userId: string;
  oldUsername: string;
  newUsername: string;
}>;

export class UserUsernameChangedEvent extends BaseDomainEvent<IUserNameChangedEvent> {
  static readonly code = asDomainEventCode('account:user:evt:username_changed');
  readonly resourceType = AggregateCodeEnum.Account.User;
  readonly audit = true;

  constructor(data: IUserNameChangedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}
