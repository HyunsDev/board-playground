import { BaseDomainEventProps, BaseDomainEvent } from '@workspace/backend-core';
import { UserId } from '@workspace/domain';
import { asDomainEventCode, AggregateCodeEnum, ManagerId, BoardId } from '@workspace/domain';

type ManagerDismissedEventProps = BaseDomainEventProps<{
  managerId: ManagerId;
  boardId: BoardId;
  userId: UserId;
  dismissedById: UserId;
}>;

export class ManagerDismissedEvent extends BaseDomainEvent<ManagerDismissedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:manager_dismissed');
  readonly resourceType = AggregateCodeEnum.Community.Manager;
  readonly audit = true;

  constructor(data: ManagerDismissedEventProps['data']) {
    super(data.managerId, data);
  }
}
