import { DomainEvent, DomainEventProps } from '@/shared/base';

export class SessionCreatedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly sessionId: string;
  public readonly sessionName: string;

  constructor(
    props: DomainEventProps & { userId: string; sessionId: string; sessionName: string },
  ) {
    super(props);
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.sessionName = props.sessionName;
  }
}
