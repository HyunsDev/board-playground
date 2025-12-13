import { Injectable } from '@nestjs/common';

import { BaseDtoMapper } from '@workspace/backend-core';
import { SessionDto } from '@workspace/contract';

import { SessionEntity } from '../domain/session.entity';


@Injectable()
export class SessionDtoMapper extends BaseDtoMapper<SessionEntity> {
  toDto(entity: SessionEntity): SessionDto {
    const props = entity.getProps();
    return {
      id: props.id,
      userId: props.userId,
      name: props.name,
      os: props.os,
      device: props.device,
      browser: props.browser,
      platform: props.platform,
      status: props.status,
      lastRefreshedAt: props.lastRefreshedAt.toISOString(),
      expiresAt: props.expiresAt.toISOString(),
      createdAt: props.createdAt.toISOString(),
      closedAt: props.closedAt?.toISOString() || null,
      revokedAt: props.revokedAt?.toISOString() || null,
    };
  }
}
