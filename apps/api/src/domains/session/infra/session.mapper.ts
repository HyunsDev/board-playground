import { Injectable } from '@nestjs/common';

import { Session } from '@workspace/db';

import { SessionEntity, SessionProps } from '../domain/session.entity';

import { BaseMapper } from '@/shared/base';

@Injectable()
export class SessionMapper extends BaseMapper<SessionEntity, Session> {
  toDomain(record: Session): SessionEntity {
    const props: SessionProps = {
      userId: record.userId,
      name: record.name,
      userAgent: record.userAgent,
      os: record.os,
      device: record.device,
      browser: record.browser,
      platform: record.platform,
      ipAddress: record.ipAddress,
      lastUsedAt: record.lastUsedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.status,
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
      lastUsedAt: props.lastUsedAt,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
