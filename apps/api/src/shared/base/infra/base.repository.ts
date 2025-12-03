import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { Prisma } from '@workspace/db'; // 또는 @prisma/client

import { Mapper } from './base.mapper';
import { LoggerPort } from '../../logger/logger.port';
import { DomainResult } from '../../types/result.type';
import { AggregateRoot } from '../domain/base.aggregate-root';
import { RepositoryPort } from '../domain/base.repository.port';
import { ConflictError, ConflictErrorDetail, NotFoundError } from '../error/common.domain-errors';

import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';

export abstract class BaseRepository<
  Aggregate extends AggregateRoot<any>,
  DbModel extends { id: string },
> implements RepositoryPort<Aggregate>
{
  protected abstract get delegate(): any;

  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventDispatcher: DomainEventDispatcher,
    protected readonly logger: LoggerPort,
  ) {}

  protected get client(): Prisma.TransactionClient | DatabaseService {
    if (this.txHost.isTransactionActive()) {
      return this.txHost.tx; // 트랜잭션 클라이언트 사용
    }
    return this.prisma; // 평상시(Non-Tx) 클라이언트 사용
  }

  async findOneById(id: string): Promise<Aggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async save(entity: Aggregate): Promise<DomainResult<Aggregate, ConflictError | NotFoundError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const result = await this.delegate.upsert({
        where: { id: entity.id },
        create: record,
        update: record,
      });

      this.publishEvents(entity);
      return ok(this.mapper.toDomain(result));
    } catch (error: any) {
      const businessError = this.handleKnownPrismaErrors(error, record);
      if (businessError) return err(businessError);

      throw error;
    }
  }

  async delete(entity: Aggregate): Promise<DomainResult<void, NotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id: entity.id },
      });
      this.publishEvents(entity);
      return ok(undefined);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(new NotFoundError(`Record with id ${entity.id} not found`));
      }
      throw error;
    }
  }

  protected publishEvents(entity: Aggregate): void {
    const events = entity.pullEvents();
    this.eventDispatcher.addEvents(events);
  }

  private handleKnownPrismaErrors(error: any, record: any): ConflictError | NotFoundError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const targets = (error.meta?.target as string[]) || [];
        const details: ConflictErrorDetail[] = targets.map((field) => ({
          field,
          value: record[field],
        }));
        return new ConflictError('Conflict detected', 'DB_CONFLICT', details);
      }
      if (error.code === 'P2025') {
        return new NotFoundError('Record not found');
      }
    }
    throw error;
  }
}
