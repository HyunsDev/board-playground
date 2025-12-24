import { BaseDomainEventProps, BaseDomainEvent } from '@workspace/backend-core';
import { ManagerRole } from '@workspace/contract';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type ManagerAppointedEventProps = BaseDomainEventProps<{
  managerId: string;
  boardId: string;
  userId: string;
  appointedById: string;
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
