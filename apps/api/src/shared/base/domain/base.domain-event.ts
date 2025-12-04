import { v7 as uuidv7 } from 'uuid';

export type DomainEventMetadata = {
  readonly timestamp: number;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
};

export interface DomainEventProps {
  aggregateId: string;
  metadata?: Partial<DomainEventMetadata>;
}

export abstract class DomainEvent {
  public readonly id: string;
  public readonly aggregateId: string;
  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps) {
    this.id = uuidv7();
    this.aggregateId = props.aggregateId;

    this.metadata = {
      correlationId: props.metadata?.correlationId || uuidv7(),
      causationId: props.metadata?.causationId,
      userId: props.metadata?.userId,
      timestamp: props.metadata?.timestamp || Date.now(),
    };
  }
}
