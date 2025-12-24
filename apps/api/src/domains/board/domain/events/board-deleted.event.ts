import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { asDomainEventCode, AggregateCodeEnum } from '@workspace/domain';

type BoardDeletedEventProps = BaseDomainEventProps<{
  boardId: string;
  slug: string;
  name: string;
  actorId: string;
}>;

export class BoardDeletedEvent extends BaseDomainEvent<BoardDeletedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:deleted');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardDeletedEventProps['data']) {
    super(data.boardId, data);
  }
}
