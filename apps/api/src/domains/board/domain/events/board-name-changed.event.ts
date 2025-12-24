type BoardNameChangedEventProps = BaseDomainEventProps<{
  actorId: string;
  boardId: string;
  oldName: string;
  newName: string;
}>;

import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

export class BoardNameChangedEvent extends BaseDomainEvent<BoardNameChangedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:name_changed');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardNameChangedEventProps['data']) {
    super(data.boardId, data);
  }
}
