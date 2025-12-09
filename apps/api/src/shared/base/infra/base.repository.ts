import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { Prisma } from '@workspace/db';

import { Mapper } from './base.mapper';
import { LoggerPort } from '../../logger/logger.port';
import { DomainResult } from '../../types/result.type';
import { AggregateRoot } from '../domain/base.aggregate-root';
import { RepositoryPort } from '../domain/base.repository.port';
import {
  EntityConflictInfo,
  EntityConflictError,
  EntityNotFoundError,
} from '../error/common.domain-errors';

import { DomainEventPublisher } from '@/infra/domain-event/domain-event.publisher';
import { PrismaService } from '@/infra/prisma/prisma.service';

export abstract class BaseRepository<
  Aggregate extends AggregateRoot<any>,
  DbModel extends { id: string },
> implements RepositoryPort<Aggregate>
{
  protected abstract get delegate(): any;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventDispatcher: DomainEventPublisher,
    protected readonly logger: LoggerPort,
  ) {}

  protected get client(): Prisma.TransactionClient | PrismaService {
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

  protected async createEntity(
    entity: Aggregate,
  ): Promise<DomainResult<Aggregate, EntityConflictError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const result = await this.delegate.create({
        data: record,
      });

      void (await this.publishEvents(entity));
      return ok(this.mapper.toDomain(result));
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details: EntityConflictInfo[] = targets.map((field) => ({
            field,
            value: record[field],
          }));
          return err(
            new EntityConflictError({
              entityName: record.constructor.name,
              conflicts: details,
            }),
          );
        }
      }
      throw error;
    }
  }

  protected async updateEntity(
    entity: Aggregate,
  ): Promise<DomainResult<Aggregate, EntityNotFoundError | EntityConflictError>> {
    const record = this.mapper.toPersistence(entity);
    try {
      const result = await this.delegate.update({
        where: { id: entity.id },
        data: record,
      });

      void (await this.publishEvents(entity));
      return ok(this.mapper.toDomain(result));
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const targets = (error.meta?.target as string[]) || [];
          const details: EntityConflictInfo[] = targets.map((field) => ({
            field,
            value: record[field],
          }));
          return err(
            new EntityConflictError({ entityName: record.constructor.name, conflicts: details }),
          );
        }
        if (error.code === 'P2025') {
          return err(
            new EntityNotFoundError({
              entityName: record.constructor.name,
              entityId: record.id,
            }),
          );
        }
      }
      throw error;
    }
  }

  protected async deleteEntity(
    entity: Aggregate,
  ): Promise<DomainResult<void, EntityNotFoundError>> {
    try {
      void (await this.delegate.delete({
        where: { id: entity.id },
      }));
      void (await this.publishEvents(entity));
      return ok(undefined);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return err(
          new EntityNotFoundError({ entityName: entity.constructor.name, entityId: entity.id }),
        );
      }
      throw error;
    }
  }

  protected async publishEvents(entity: Aggregate): Promise<void> {
    const events = entity.pullEvents();
    void (await this.eventDispatcher.publishMany(events));
  }
}
