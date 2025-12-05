import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { Session, PrismaClient } from '@workspace/db';

import { SessionMapper } from './session.mapper';
import { SessionNotFoundError } from '../domain/session.domain-errors';
import { SessionEntity } from '../domain/session.entity';
import { SessionRepositoryPort } from '../domain/session.repository.port';

import { ContextService } from '@/infra/context/context.service';
import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { UnexpectedDomainErrorException } from '@/shared/base';
import { BaseRepository } from '@/shared/base/infra/base.repository';
import { DomainResult } from '@/shared/types/result.type';
import { matchError } from '@/shared/utils/match-error.utils';

@Injectable()
export class SessionRepository
  extends BaseRepository<SessionEntity, Session>
  implements SessionRepositoryPort
{
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly context: ContextService,
    protected readonly mapper: SessionMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
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
    return (await this.createEntity(session)).match(
      (session) => ok(session),
      (error) =>
        matchError(error, {
          EntityConflict: () => {
            throw new UnexpectedDomainErrorException(error);
          },
        }),
    );
  }

  async update(session: SessionEntity) {
    return (await this.updateEntity(session)).match(
      (session) => ok(session),
      (error) =>
        matchError(error, {
          EntityConflict: () => {
            throw new UnexpectedDomainErrorException(error);
          },
          EntityNotFound: () => err(new SessionNotFoundError()),
        }),
    );
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
}
