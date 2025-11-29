import { DomainEvent, DomainEventProps } from '@/shared/ddd';

export class DeviceDeletedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly deviceId: string;
  public readonly deviceName: string;

  constructor(props: DomainEventProps & { userId: string; deviceId: string; deviceName: string }) {
    super(props);
    this.userId = props.userId;
    this.deviceId = props.deviceId;
    this.deviceName = props.deviceName;
  }
}
