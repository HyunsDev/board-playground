import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { ManagerRole } from '@workspace/contract';
import { AggregateCodeEnum, asDomainEventCode, BoardId, ManagerId } from '@workspace/domain';

export type ManagerRoleChangedEventProps = BaseDomainEventProps<{
  managerId: ManagerId;
  boardId: BoardId;
  oldRole: ManagerRole;
  newRole: ManagerRole;
  actorId: UserId;
}>;

export class ManagerRoleChangedEvent extends BaseDomainEvent<ManagerRoleChangedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:manager_role_changed');
  readonly resourceType = AggregateCodeEnum.Community.Manager;
  readonly audit = true;

  constructor(data: ManagerRoleChangedEventProps['data']) {
    super(data.managerId, data);
  }
}
