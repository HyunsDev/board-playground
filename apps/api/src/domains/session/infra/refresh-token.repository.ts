import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { PrismaClient, RefreshToken } from '@workspace/db';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { RefreshTokenEntity } from '../domain/refresh-token.entity';
import { RefreshTokenRepositoryPort } from '../domain/refresh-token.repository.port';
import { InvalidRefreshTokenError, RefreshTokenNotFoundError } from '../domain/token.domain-errors';

import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { BaseRepository, InternalServerErrorException } from '@/shared/base';
import { DomainResult } from '@/shared/types/result.type';
import { matchError } from '@/shared/utils/match-error.utils';

@Injectable()
export class RefreshTokenRepository
  extends BaseRepository<RefreshTokenEntity, RefreshToken>
  implements RefreshTokenRepositoryPort
{
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly mapper: RefreshTokenMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, txHost, mapper, eventDispatcher, new Logger(RefreshTokenRepository.name));
  }

  protected get delegate(): PrismaClient['refreshToken'] {
    return this.client.refreshToken;
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

  async create(refreshToken: RefreshTokenEntity) {
    return (await this.createEntity(refreshToken)).match(
      (token) => ok(token),
      (error) =>
        matchError(error, {
          EntityConflict: () => {
            // 혹시라도 리프레시 토큰 충돌 발생시 500 에러로 처리
            throw new InternalServerErrorException();
          },
        }),
    );
  }

  async update(refreshToken: RefreshTokenEntity) {
    return (await this.updateEntity(refreshToken)).match(
      (token) => ok(token),
      (error) =>
        matchError(error, {
          EntityNotFound: () => {
            return err(new RefreshTokenNotFoundError());
          },
          EntityConflict: () => {
            // 혹시라도 리프레시 토큰 충돌 발생시 500 에러로 처리
            throw new InternalServerErrorException();
          },
        }),
    );
  }

  async delete(refreshToken: RefreshTokenEntity) {
    return (await this.deleteEntity(refreshToken)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => {
            return err(new RefreshTokenNotFoundError());
          },
        }),
    );
  }
}
