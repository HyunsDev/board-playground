import { BaseDomainEventProps, BaseDomainEvent } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { ManagerRole } from '@workspace/contract';
import { AggregateCodeEnum, asDomainEventCode, BoardId, ManagerId } from '@workspace/domain';

type ManagerAppointedEventProps = BaseDomainEventProps<{
  managerId: ManagerId;
  boardId: BoardId;
  userId: UserId;
  appointedById: UserId;
  role: ManagerRole;
}>;

export class ManagerAppointedEvent extends BaseDomainEvent<ManagerAppointedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:manager_appointed');
  readonly resourceType = AggregateCodeEnum.Community.Manager;
  readonly audit = true;

  constructor(data: ManagerAppointedEventProps['data']) {
    super(data.managerId, data);
  }
}
