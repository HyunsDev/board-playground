import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type BoardCreatedEventProps = BaseDomainEventProps<{
  boardId: string;
  slug: string;
  name: string;
  actorId: string;
}>;

export class BoardCreatedEvent extends BaseDomainEvent<BoardCreatedEventProps> {
  static readonly code = asDomainEventCode('community:board:evt:created');
  readonly resourceType = AggregateCodeEnum.Community.Board;
  readonly audit = true;

  constructor(data: BoardCreatedEventProps['data']) {
    super(data.boardId, data);
  }
}
