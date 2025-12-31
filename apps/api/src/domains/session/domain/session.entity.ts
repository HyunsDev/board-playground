import { err, ok } from 'neverthrow';
import { UAParser } from 'ua-parser-js';
import { v7 as uuidv7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';
import { EntityCollection, matchError, typedOk } from '@workspace/backend-ddd';
import { DevicePlatform, SESSION_STATUS, SessionStatus } from '@workspace/contract';
import { UserId } from '@workspace/domain';
import { SessionId } from '@workspace/domain';

import { RefreshTokenReuseDetectedEvent } from './events/refresh-token-reuse-detected.event';
import { SessionCreatedEvent } from './events/session-created.event';
import { SessionDeletedEvent } from './events/session-deleted.event';
import { SessionRefreshedEvent } from './events/session-refreshed.event';
import { RefreshTokenEntity } from './refresh-token.entity';
import { SessionClosedError, SessionRevokedError } from './session.domain-errors';
import { InvalidRefreshTokenError } from './token.domain-errors';

export interface SessionProps extends BaseEntityProps<SessionId> {
  userId: UserId;
  name: string;
  userAgent: string;
  os: string;
  device: string;
  browser: string;
  platform: DevicePlatform;
  ipAddress: string | null;
  lastRefreshedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  revokedAt: Date | null;
  status: SessionStatus;
  refreshTokenCollection: EntityCollection<RefreshTokenEntity>;
}

export interface CreateSessionProps {
  userId: UserId;
  userAgent: string;
  platform: DevicePlatform;
  ipAddress: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export class SessionEntity extends BaseAggregateRoot<SessionProps, SessionId> {
  private constructor(props: SessionProps) {
    super({
      id: props.id || (uuidv7() as SessionId),
      props,
    });
  }

  public static create(createProps: CreateSessionProps): SessionEntity {
    const id = uuidv7() as SessionId;
    const userAgentResult = new UAParser(createProps.userAgent).getResult();
    const props: SessionProps = {
      id,
      status: SESSION_STATUS.ACTIVE,
      userId: createProps.userId,
      name: `${userAgentResult.os.toString()} - ${userAgentResult.browser.toString()}`,
      userAgent: createProps.userAgent,
      os: userAgentResult.os.toString(),
      device: userAgentResult.device.toString(),
      browser: userAgentResult.browser.toString(),
      platform: createProps.platform,
      ipAddress: createProps.ipAddress,
      lastRefreshedAt: new Date(),
      expiresAt: createProps.expiresAt, // 30 days
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      revokedAt: null,
      refreshTokenCollection: EntityCollection.fromArray([
        RefreshTokenEntity.create({
          token: createProps.refreshTokenHash,
          expiresAt: createProps.expiresAt,
          sessionId: id,
        }),
      ]),
    };
    const session = new SessionEntity(props);

    session.addEvent(
      new SessionCreatedEvent({
        sessionId: id,
        userId: props.userId,
        sessionName: props.name,
      }),
    );

    return session;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get isActive(): boolean {
    return this.props.status === SESSION_STATUS.ACTIVE;
  }

  public rotateRefreshToken({
    currentTokenHash,
    newTokenHash,
    expiresAt,
  }: {
    currentTokenHash: string;
    newTokenHash: string;
    expiresAt: Date;
  }) {
    if (this.props.status === 'REVOKED') {
      return err(new SessionRevokedError());
    }

    if (this.props.status === 'CLOSED') {
      return err(new SessionClosedError());
    }

    const currentToken = this.props.refreshTokenCollection.find(
      (t) => t.token === currentTokenHash,
    );
    if (!currentToken) {
      return err(new InvalidRefreshTokenError());
    }

    const tokenUseResult = currentToken.use();
    if (tokenUseResult.isErr()) {
      return matchError(tokenUseResult.error, {
        TokenReuseDetected: () => {
          this.addEvent(
            new RefreshTokenReuseDetectedEvent({
              userId: this.props.userId,
              sessionId: this.id,
              reusedTokenId: currentToken.id,
            }),
          );
          this.revoke();
          return typedOk('revoked', {
            reason: 'TokenReuseDetected',
          });
        },
        ExpiredToken: (e) => err(e),
      });
    }

    const newToken = RefreshTokenEntity.create({
      token: newTokenHash,
      expiresAt,
      sessionId: this.id,
    });

    void this.props.refreshTokenCollection.add(newToken);
    this.props.lastRefreshedAt = new Date();
    this.props.expiresAt = expiresAt;

    this.addEvent(
      new SessionRefreshedEvent({
        sessionId: this.id,
        userId: this.props.userId,
        newRefreshTokenId: newToken.id,
      }),
    );

    return typedOk('success', {
      newToken,
    });
  }

  public close() {
    if (this.props.status === 'REVOKED') {
      return err(new SessionRevokedError());
    }

    if (this.props.status === 'CLOSED') {
      return err(new SessionClosedError());
    }

    this.props.status = SESSION_STATUS.CLOSED;
    this.props.closedAt = new Date();
    return ok(this);
  }

  public delete() {
    this.addEvent(
      new SessionDeletedEvent({
        userId: this.props.userId,
        sessionId: this.id,
        sessionName: this.props.name,
      }),
    );

    return ok(this.toDeleted());
  }

  private revoke(): void {
    this.props.status = SESSION_STATUS.REVOKED;
    this.props.revokedAt = new Date();
  }

  public validate() {}
}
