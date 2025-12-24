import { BaseDomainEventProps, BaseDomainEvent } from '@workspace/backend-core';
import { asDomainEventCode, AggregateCodeEnum } from '@workspace/domain';

type ManagerDismissedEventProps = BaseDomainEventProps<{
  managerId: string;
  boardId: string;
  userId: string;
  dismissedById: string;
}>;

export class ManagerDismissedEvent extends BaseDomainEvent<ManagerDismissedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:manager_dismissed');
  readonly resourceType = AggregateCodeEnum.Community.Manager;
  readonly audit = true;

  constructor(data: ManagerDismissedEventProps['data']) {
    super(data.managerId, data);
  }
}
