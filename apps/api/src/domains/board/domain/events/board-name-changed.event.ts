type BoardNameChangedEventProps = BaseDomainEventProps<{
  actorId: UserId;
  boardId: BoardId;
  oldName: string;
  newName: string;
}>;

import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { UserId } from '@workspace/domain';
import { AggregateCodeEnum, asDomainEventCode, BoardId } from '@workspace/domain';

export class BoardNameChangedEvent extends BaseDomainEvent<BoardNameChangedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:name_changed');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardNameChangedEventProps['data']) {
    super(data.boardId, data);
  }
}
