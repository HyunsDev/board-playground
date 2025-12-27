import { Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';

import {
  BaseEntityRepository,
  PrismaService,
  TransactionContext,
  UnexpectedPrismaErrorException,
} from '@workspace/backend-core';
import { DomainResultAsync, matchError } from '@workspace/backend-ddd';
import { PrismaClient, RefreshToken } from '@workspace/database';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { RefreshTokenEntity } from '../domain/refresh-token.entity';
import { RefreshTokenRepositoryPort } from '../domain/refresh-token.repository.port';

@Injectable()
export class RefreshTokenRepository
  extends BaseEntityRepository<RefreshTokenEntity, RefreshToken, PrismaClient['refreshToken']>
  implements RefreshTokenRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: RefreshTokenMapper,
  ) {
    super(prisma, txContext, mapper);
  }

  protected get delegate(): PrismaClient['refreshToken'] {
    return this.client.refreshToken;
  }

  createMany(tokens: RefreshTokenEntity[]): DomainResultAsync<RefreshTokenEntity[], never> {
    return ResultAsync.combine(tokens.map((token) => this.createEntity(token))).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          throw new UnexpectedPrismaErrorException(this.constructor.name, 'createMany', e);
        },
      }),
    );
  }

  updateMany(tokens: RefreshTokenEntity[]): DomainResultAsync<RefreshTokenEntity[], never> {
    return ResultAsync.combine(tokens.map((token) => this.updateEntity(token))).mapErr((error) =>
      matchError(error, {
        EntityNotFound: (e) => {
          throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateMany', e);
        },
        EntityConflict: (e) => {
          throw new UnexpectedPrismaErrorException(this.constructor.name, 'updateMany', e);
        },
      }),
    );
  }

  deleteMany(tokens: RefreshTokenEntity[]): DomainResultAsync<void, never> {
    return ResultAsync.combine(tokens.map((token) => this.deleteEntity(token)))
      .map(() => undefined)
      .mapErr((error) =>
        matchError(error, {
          EntityNotFound: (e) => {
            throw new UnexpectedPrismaErrorException(this.constructor.name, 'deleteMany', e);
          },
        }),
      );
  }
}
