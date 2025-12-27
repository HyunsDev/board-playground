import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode, BoardId, BoardSlug } from '@workspace/domain';

type BoardCreatedEventProps = BaseDomainEventProps<{
  boardId: BoardId;
  slug: BoardSlug;
  name: string;
  creatorId: string;
}>;

export class BoardCreatedEvent extends BaseDomainEvent<BoardCreatedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:created');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardCreatedEventProps['data']) {
    super(data.boardId, data);
  }
}
