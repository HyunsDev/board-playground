import { Injectable } from '@nestjs/common';

import { RefreshToken, Session } from '@workspace/db';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { SessionEntity, SessionProps } from '../domain/session.entity';

import { BaseMapper } from '@/shared/base';

@Injectable()
export class SessionMapper extends BaseMapper<SessionEntity, Session> {
  constructor(private readonly refreshTokenMapper: RefreshTokenMapper) {
    super();
  }

  toDomain(
    record: Session & {
      refreshTokens?: RefreshToken[];
    },
  ): SessionEntity {
    const props: SessionProps = {
      userId: record.userId,
      name: record.name,
      userAgent: record.userAgent,
      os: record.os,
      device: record.device,
      browser: record.browser,
      platform: record.platform,
      ipAddress: record.ipAddress,
      lastRefreshedAt: record.lastRefreshedAt,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      closedAt: record.closedAt,
      revokedAt: record.revokedAt,
      status: record.status,
      refreshTokens:
        record.refreshTokens?.map((token) => this.refreshTokenMapper.toDomain(token)) ?? [],
    };
    return SessionEntity.reconstruct(props, record.id);
  }

  toPersistence(entity: SessionEntity): Session {
    const props = entity.getProps();
    return {
      id: props.id,
      userId: props.userId,
      name: props.name,
      userAgent: props.userAgent,
      os: props.os,
      device: props.device,
      browser: props.browser,
      platform: props.platform,
      ipAddress: props.ipAddress,
      lastRefreshedAt: props.lastRefreshedAt,
      expiresAt: props.expiresAt,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      closedAt: props.closedAt,
      revokedAt: props.revokedAt,
    };
  }
}
