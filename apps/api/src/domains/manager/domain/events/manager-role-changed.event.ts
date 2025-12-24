import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

export type ManagerRoleChangedEventProps = BaseDomainEventProps<{
  managerId: string;
  boardId: string;
  oldRole: string;
  newRole: string;
  actorId: string;
}>;

export class ManagerRoleChangedEvent extends BaseDomainEvent<ManagerRoleChangedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:manager_role_changed');
  readonly resourceType = AggregateCodeEnum.Community.Manager;
  readonly audit = true;

  constructor(data: ManagerRoleChangedEventProps['data']) {
    super(data.managerId, data);
  }
}
