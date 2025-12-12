import { Injectable } from '@nestjs/common';

import { RefreshToken } from '@workspace/database';

import { RefreshTokenEntity, RefreshTokenProps } from '../domain/refresh-token.entity';

import { BaseMapper } from '@/shared/base';

@Injectable()
export class RefreshTokenMapper extends BaseMapper<RefreshTokenEntity, RefreshToken> {
  toDomain(record: RefreshToken): RefreshTokenEntity {
    const props: RefreshTokenProps = {
      id: record.id,
      sessionId: record.sessionId,
      hashedToken: record.hashedToken,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
      isUsed: record.isUsed,
    };
    return RefreshTokenEntity.reconstruct(props, record.id);
  }
  toPersistence(entity: RefreshTokenEntity): RefreshToken {
    const props = entity.getProps();
    return {
      id: props.id,
      sessionId: props.sessionId,
      hashedToken: props.hashedToken,
      isUsed: props.isUsed,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
