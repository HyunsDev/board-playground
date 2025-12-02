import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { PrismaClient, RefreshToken } from '@workspace/db';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { RefreshTokenEntity } from '../domain/refresh-token.entity';
import { RefreshTokenRepositoryPort } from '../domain/refresh-token.repository.port';
import { InvalidRefreshTokenError } from '../domain/session.errors';

import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { BaseRepository } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';

@Injectable()
export class RefreshTokenRepository
  extends BaseRepository<RefreshTokenEntity, RefreshToken>
  implements RefreshTokenRepositoryPort
{
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly mapper: RefreshTokenMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, mapper, eventDispatcher, new Logger(RefreshTokenRepository.name));
  }

  protected get delegate(): PrismaClient['refreshToken'] {
    return this.prisma.refreshToken;
  }

  async getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): Promise<DomainResult<RefreshTokenEntity, InvalidRefreshTokenError>> {
    const tokenData = await this.delegate.findUnique({
      where: {
        token: hashedRefreshToken,
      },
    });

    if (!tokenData) {
      return err(new InvalidRefreshTokenError());
    }

    return ok(this.mapper.toDomain(tokenData));
  }
}
