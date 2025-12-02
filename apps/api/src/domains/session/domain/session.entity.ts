import { UAParser } from 'ua-parser-js';
import { v7 as uuidv7 } from 'uuid';

import { DevicePlatform, SESSION_STATUS, SessionStatus } from '@workspace/contract';

import { SessionCreatedEvent } from './events/session-created.event';
import { SessionDeletedEvent } from './events/session-deleted.event';

import { AggregateRoot, CommandMetadata } from '@/shared/base';

export interface SessionProps {
  userId: string;
  name: string;
  userAgent: string;
  os: string;
  device: string;
  browser: string;
  platform: DevicePlatform;
  ipAddress: string | null;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
}

export interface CreateSessionProps {
  userId: string;
  userAgent: string;
  platform: DevicePlatform;
  ipAddress: string;
}

export class SessionEntity extends AggregateRoot<SessionProps> {
  private constructor(props: SessionProps, id?: string) {
    super({
      id: id || uuidv7(),
      props,
    });
  }

  public static create(createProps: CreateSessionProps, metadata?: CommandMetadata): SessionEntity {
    const id = uuidv7();
    const userAgentResult = new UAParser(createProps.userAgent).getResult();

    const props: SessionProps = {
      status: SESSION_STATUS.ACTIVE,
      userId: createProps.userId,
      name: `${userAgentResult.os.toString()} - ${userAgentResult.browser.toString()}`,
      userAgent: createProps.userAgent,
      os: userAgentResult.os.toString(),
      device: userAgentResult.device.toString(),
      browser: userAgentResult.browser.toString(),
      platform: createProps.platform,
      ipAddress: createProps.ipAddress,
      lastUsedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const device = new SessionEntity(props, id);

    device.addEvent(
      new SessionCreatedEvent({
        aggregateId: id,
        userId: props.userId,
        sessionId: id,
        sessionName: props.name,
        metadata,
      }),
    );

    return device;
  }

  get userId(): string {
    return this.props.userId;
  }

  revoke(): void {
    this.props.status = SESSION_STATUS.REVOKED;
  }

  public delete(): void {
    this.addEvent(
      new SessionDeletedEvent({
        aggregateId: this.id,
        userId: this.props.userId,
        sessionId: this.id,
        sessionName: this.props.name,
      }),
    );
  }

  static reconstruct(props: SessionProps, id: string): SessionEntity {
    return new SessionEntity(props, id);
  }

  get isRevoked(): boolean {
    return this.props.status === SESSION_STATUS.REVOKED;
  }

  public updateLastUsedAt(): void {
    this.props.lastUsedAt = new Date();
  }

  public validate() {}
}
