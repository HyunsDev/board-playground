import { Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import {
  DeletedAggregate,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { Session, PrismaClient } from '@workspace/database';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { SessionMapper } from './session.mapper';
import { RefreshTokenRepositoryPort } from '../domain/refresh-token.repository.port';
import { SessionConflictError, SessionNotFoundError } from '../domain/session.domain-errors';
import { SessionEntity } from '../domain/session.entity';
import { SessionRepositoryPort } from '../domain/session.repository.port';
import { InvalidRefreshTokenError } from '../domain/token.domain-errors';

@Injectable()
export class SessionRepository
  extends BaseRepository<SessionEntity, Session, PrismaClient['session']>
  implements SessionRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: SessionMapper,
    protected readonly refreshTokenMapper: RefreshTokenMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
    protected readonly refreshTokenRepo: RefreshTokenRepositoryPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher);
  }

  protected get delegate(): PrismaClient['session'] {
    return this.client.session;
  }

  getOneById(id: string) {
    return this.getUniqueEntity({ where: { id } }).mapErr((e) =>
      matchError(e, {
        EntityNotFound: () => new SessionNotFoundError(),
      }),
    );
  }

  getOneByIdAndUserId(id: string, userId: string) {
    return this.getUniqueEntity({
      where: { id, userId },
    }).mapErr((e) =>
      matchError(e, {
        EntityNotFound: () => new SessionNotFoundError(),
      }),
    );
  }

  listAllByUserId(userId: string) {
    return this.findManyEntities({
      where: { userId },
    });
  }

  listActiveByUserId(userId: string) {
    return this.findManyEntities({
      where: { userId, status: 'ACTIVE' },
    });
  }

  create(session: SessionEntity) {
    return this.createEntity(session)
      .mapErr((e) =>
        matchError(e, {
          EntityConflict: () => {
            throw new UnexpectedDomainErrorException(new SessionConflictError());
          },
        }),
      )
      .andTee(() => {
        const { added } = session.getProps().refreshTokenCollection.getChanges();
        return this.refreshTokenRepo.createMany(added);
      });
  }

  update(session: SessionEntity) {
    return this.updateEntity(session)
      .mapErr((e) =>
        matchError(e, {
          EntityNotFound: () => new SessionNotFoundError(),
          EntityConflict: () => {
            throw new UnexpectedDomainErrorException(new SessionConflictError());
          },
        }),
      )
      .andTee(() => {
        const { added, current, removed } = session.getProps().refreshTokenCollection.getChanges();
        return ResultAsync.combine([
          this.refreshTokenRepo.createMany(added),
          this.refreshTokenRepo.updateMany(current),
          this.refreshTokenRepo.deleteMany(removed),
        ]);
      });
  }

  delete(session: DeletedAggregate<SessionEntity>) {
    return this.deleteEntity(session).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new SessionNotFoundError(),
      }),
    );
  }

  getOneByHashedRefreshToken(hashedRefreshToken: string) {
    return this.getFirstEntity({
      where: {
        refreshTokens: {
          some: {
            hashedToken: hashedRefreshToken,
          },
        },
      },
      include: {
        refreshTokens: {
          where: {
            hashedToken: hashedRefreshToken,
          },
        },
      },
    }).mapErr((e) =>
      matchError(e, {
        EntityNotFound: () => new InvalidRefreshTokenError(),
      }),
    );
  }
}
