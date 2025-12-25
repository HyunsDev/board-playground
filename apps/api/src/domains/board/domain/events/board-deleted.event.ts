import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { asDomainEventCode, AggregateCodeEnum, BoardId, BoardSlug } from '@workspace/domain';

type BoardDeletedEventProps = BaseDomainEventProps<{
  boardId: BoardId;
  slug: BoardSlug;
  name: string;
  actorId: UserId;
}>;

export class BoardDeletedEvent extends BaseDomainEvent<BoardDeletedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:deleted');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardDeletedEventProps['data']) {
    super(data.boardId, data);
  }
}
