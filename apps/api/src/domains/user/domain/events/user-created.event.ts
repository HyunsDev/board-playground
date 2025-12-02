import { DomainEvent, DomainEventProps } from '@/shared/base';

export class UserCreatedEvent extends DomainEvent {
  public readonly email: string;
  public readonly username: string;
  public readonly nickname: string;

  constructor(props: DomainEventProps & { email: string; username: string; nickname: string }) {
    super(props);
    this.email = props.email;
    this.username = props.username;
    this.nickname = props.nickname;
  }
}
