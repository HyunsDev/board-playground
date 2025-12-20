import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { BaseRepository, PrismaService } from '@workspace/backend-core';
import {
  AbstractDomainEventPublisherPort,
  DomainResult,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { Session, PrismaClient, Prisma } from '@workspace/database';

import { RefreshTokenMapper } from './refresh-token.mapper';
import { SessionMapper } from './session.mapper';
import { SessionConflictError, SessionNotFoundError } from '../domain/session.domain-errors';
import { SessionEntity } from '../domain/session.entity';
import { SessionRepositoryPort } from '../domain/session.repository.port';
import { InvalidRefreshTokenError } from '../domain/token.domain-errors';

@Injectable()
export class SessionRepository
  extends BaseRepository<SessionEntity, Session>
  implements SessionRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly mapper: SessionMapper,
    protected readonly refreshTokenMapper: RefreshTokenMapper,
    protected readonly eventDispatcher: AbstractDomainEventPublisherPort,
  ) {
    super(prisma, txHost, mapper, eventDispatcher, new Logger(SessionRepository.name));
  }

  protected get delegate(): PrismaClient['session'] {
    return this.client.session;
  }

  async getOneById(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new SessionNotFoundError());
    }
    return ok(result);
  }

  async getOneByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<DomainResult<SessionEntity, SessionNotFoundError>> {
    const record = await this.delegate.findFirst({
      where: { id, userId },
    });
    if (!record) {
      return err(new SessionNotFoundError());
    }
    return ok(this.mapper.toDomain(record));
  }

  async listAllByUserId(userId: string): Promise<SessionEntity[]> {
    const records = await this.delegate.findMany({
      where: { userId },
    });
    return this.mapper.toDomainMany(records);
  }

  async create(session: SessionEntity) {
    const result = await this.createEntity(session);
    if (result.isErr()) {
      return matchError(result.error, {
        EntityConflict: () => {
          throw new UnexpectedDomainErrorException(new SessionConflictError());
        },
      });
    }

    for (const token of session.getProps().refreshTokens) {
      try {
        const record = this.refreshTokenMapper.toPersistence(token);
        void (await this.client.refreshToken.create({
          data: record,
        }));
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            // 토큰 중복은 표시 방지를 위해 InvalidRefreshTokenError 로 변환
            throw new InternalServerErrorException();
          }
        }
        throw error;
      }
    }
    return ok(result.value);
  }

  async update(session: SessionEntity) {
    const result = await this.updateEntity(session);
    if (result.isErr()) {
      return matchError(result.error, {
        EntityNotFound: () => err(new SessionNotFoundError()),
        EntityConflict: () => {
          throw new UnexpectedDomainErrorException(new SessionConflictError());
        },
      });
    }

    for (const token of session.getProps().refreshTokens) {
      try {
        const record = this.refreshTokenMapper.toPersistence(token);
        void (await this.client.refreshToken.upsert({
          where: { id: record.id },
          create: record,
          update: record,
        }));
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            // 토큰 중복은 표시 방지를 위해 InvalidRefreshTokenError 로 변환
            throw new InternalServerErrorException();
          }
        }
        throw error;
      }
    }
    return ok(result.value);
  }

  async delete(session: SessionEntity) {
    return (await this.deleteEntity(session)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new SessionNotFoundError()),
        }),
    );
  }

  async getOneByHashedRefreshToken(
    hashedRefreshToken: string,
  ): Promise<DomainResult<SessionEntity, InvalidRefreshTokenError>> {
    const tokenRecord = await this.client.refreshToken.findUnique({
      where: {
        hashedToken: hashedRefreshToken,
      },
      select: {
        sessionId: true,
      },
    });

    if (!tokenRecord) {
      return err(new InvalidRefreshTokenError());
    }

    const session = await this.delegate.findUnique({
      where: {
        id: tokenRecord.sessionId,
      },
      include: {
        refreshTokens: {
          where: {
            hashedToken: hashedRefreshToken,
          },
        },
      },
    });

    if (!session) {
      return err(new InvalidRefreshTokenError());
    }
    return ok(this.mapper.toDomain(session));
  }
}
