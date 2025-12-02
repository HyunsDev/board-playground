import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { Session, PrismaClient } from '@workspace/db';

import { SessionMapper } from './session.mapper';
import { SessionEntity } from '../domain/session.entity';
import { SessionNotFoundError } from '../domain/session.errors';
import { SessionRepositoryPort } from '../domain/session.repository.port';

import { ContextService } from '@/infra/context/context.service';
import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { BaseRepository } from '@/shared/base/infra/base.repository';
import { DomainResult } from '@/shared/types/result.type';

@Injectable()
export class SessionRepository
  extends BaseRepository<SessionEntity, Session>
  implements SessionRepositoryPort
{
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly context: ContextService,
    protected readonly mapper: SessionMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, mapper, eventDispatcher, new Logger(SessionRepository.name));
  }

  protected get delegate(): PrismaClient['session'] {
    return (this.prisma as PrismaClient).session;
  }

  async getOneById(id: string): Promise<DomainResult<SessionEntity, SessionNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new SessionNotFoundError());
    }
    return ok(result);
  }
}
