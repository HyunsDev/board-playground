import { UAParser } from 'ua-parser-js';
import { v7 as uuidv7 } from 'uuid';

import { DevicePlatform } from '@workspace/contract';

import { DeviceCreatedEvent } from './events/device-created.event';
import { DeviceDeletedEvent } from './events/device-deleted.event';

import { AggregateRoot, CommandMetadata } from '@/libs/ddd';

export interface DeviceProps {
  userId: string;
  hashedRefreshToken: string | null;
  name: string;
  userAgent: string;
  os: string;
  device: string;
  browser: string;
  platform: DevicePlatform;
  ipAddress: string | null;
  lastRefreshedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceProps {
  userId: string;
  hashedRefreshToken: string;
  userAgent: string;
  platform: DevicePlatform;
  ipAddress: string;
}

export class DeviceEntity extends AggregateRoot<DeviceProps> {
  private constructor(props: DeviceProps, id?: string) {
    super({
      id: id || uuidv7(),
      props,
    });
  }

  public static create(createProps: CreateDeviceProps, metadata?: CommandMetadata): DeviceEntity {
    const id = uuidv7();
    const userAgentResult = new UAParser(createProps.userAgent).getResult();

    const props: DeviceProps = {
      userId: createProps.userId,
      hashedRefreshToken: createProps.hashedRefreshToken,
      name: `${userAgentResult.os.toString()} - ${userAgentResult.browser.toString()}`,
      userAgent: createProps.userAgent,
      os: userAgentResult.os.toString(),
      device: userAgentResult.device.toString(),
      browser: userAgentResult.browser.toString(),
      platform: createProps.platform,
      ipAddress: createProps.ipAddress,
      lastRefreshedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const device = new DeviceEntity(props, id);

    device.addEvent(
      new DeviceCreatedEvent({
        aggregateId: id,
        userId: props.userId,
        deviceId: id,
        deviceName: props.name,
        metadata,
      }),
    );

    return device;
  }

  get userId(): string {
    return this.props.userId;
  }

  public updateRefreshToken(hashedRefreshToken: string) {
    this.props.hashedRefreshToken = hashedRefreshToken;
    this.props.lastRefreshedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.addEvent(
      new DeviceDeletedEvent({
        aggregateId: this.id,
        userId: this.props.userId,
        deviceId: this.id,
        deviceName: this.props.name,
      }),
    );
  }

  static reconstruct(props: DeviceProps, id: string): DeviceEntity {
    return new DeviceEntity(props, id);
  }

  public validate(): void {}
}
