import { Prisma } from '@prisma/client';
import { err, ok } from 'neverthrow';

import { Mapper } from './base.mapper';
import { LoggerPort } from '../../logger/logger.port';
import { DomainResult } from '../../types/result.type';
import { AggregateRoot } from '../domain/base.aggregate-root';
import { RepositoryPort } from '../domain/base.repository.port';
import { ConflictError, ConflictErrorDetail, NotFoundError } from '../error/common.domain-errors';

import { ContextService } from '@/infra/context/context.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { DatabaseService } from '@/infra/database/database.service';

export abstract class BaseRepository<
  Aggregate extends AggregateRoot<any>,
  DbModel extends { id: string },
> implements RepositoryPort<Aggregate>
{
  protected abstract get delegate(): any;

  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly context: ContextService,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventDispatcher: DomainEventDispatcher,
    protected readonly logger: LoggerPort,
  ) {}

  protected get client(): Prisma.TransactionClient | DatabaseService {
    const tx = this.context.getTx();
    return tx ?? this.prisma;
  }

  async findOneById(id: string): Promise<Aggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async insert(entity: Aggregate): Promise<DomainResult<Aggregate, ConflictError>> {
    const record = this.mapper.toPersistence(entity);

    try {
      const result = await this.delegate.create({ data: record });
      await this.publishEvents(entity);
      return ok(result ? this.mapper.toDomain(result) : null);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const targets = (error.meta?.target as string[]) || [];
        const details: ConflictErrorDetail[] = targets.map((field) => ({
          field,
          value: (record as any)[field], // 입력된 값 추적
        }));
        return err(new ConflictError('Conflict detected', 'DB_CONFLICT', details));
      }
      throw error;
    }
  }

  async update(entity: Aggregate): Promise<DomainResult<Aggregate, NotFoundError | ConflictError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const updatedRecord = await this.delegate.update({
        where: { id: entity.id },
        data: record,
      });
      await this.publishEvents(entity);
      return ok(this.mapper.toDomain(updatedRecord));
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(new NotFoundError(`Record with id ${entity.id} not found`));
        }
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details: ConflictErrorDetail[] = targets.map((field) => ({
            field,
            value: (record as any)[field],
          }));
          return err(new ConflictError('Conflict detected', 'DB_CONFLICT', details));
        }
      }

      throw error;
    }
  }

  async delete(entity: Aggregate): Promise<DomainResult<void, NotFoundError>> {
    try {
      await this.delegate.delete({
        where: { id: entity.id },
      });
      await this.publishEvents(entity);
      return ok(undefined);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(new NotFoundError(`Record with id ${entity.id} not found`));
      }
      throw error;
    }
  }

  private async publishEvents(entity: Aggregate): Promise<void> {
    const events = entity.pullEvents();
    this.eventDispatcher.addEvents(events);
  }
}
