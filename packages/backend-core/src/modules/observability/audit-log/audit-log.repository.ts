import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { createPaginatedResult, PaginatedResult } from '@workspace/common';
import { AuditLog, Prisma, PrismaClient } from '@workspace/database';

import { AuditLogNotFoundError } from './audit-log.errors';
import { AuditLogRepositoryPort, CreateAuditLogParam } from './audit-log.repository.port';
import { AuditLogFilterOptions, AuditLogQueryParam } from './audit.log.types';

import { BaseDirectRepository } from '@/base';
import { PrismaService, TransactionContext } from '@/modules';

@Injectable()
export class AuditLogRepository
  extends BaseDirectRepository<AuditLog, PrismaClient['auditLog']>
  implements AuditLogRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
  ) {
    super(prisma, txContext.txHost, new Logger(AuditLogRepository.name));
  }

  protected get delegate(): PrismaClient['auditLog'] {
    return this.client.auditLog;
  }

  async create(param: CreateAuditLogParam) {
    const now = new Date();
    const item: Prisma.AuditLogCreateInput = {
      id: v7(),
      actorId: param.actorId ?? null,
      targetType: param.targetType,
      targetId: param.targetId ?? null,
      eventCode: param.eventCode,
      correlationId: param.correlationId ?? null,
      ipAddress: param.ipAddress ?? null,
      data: param.data ?? {},
      metadata: param.metadata ?? {},
      occurredAt: param.occurredAt ?? now,
    };

    return (await this.safeCreate(item)).match(
      (result) => ok(result),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async createMany(params: CreateAuditLogParam[]) {
    const now = new Date();
    const items: Prisma.AuditLogCreateInput[] = params.map((param) => ({
      id: v7(),
      actorId: param.actorId ?? null,
      targetType: param.targetType,
      targetId: param.targetId ?? null,
      eventCode: param.eventCode,
      correlationId: param.correlationId ?? null,
      ipAddress: param.ipAddress ?? null,
      data: param.data ?? {},
      metadata: param.metadata ?? {},
      occurredAt: param.occurredAt ?? now,
    }));

    await this.safeCreateMany(items);

    return ok(undefined);
  }

  async getOneById(id: string) {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    if (!record) {
      return err(new AuditLogNotFoundError(id));
    }
    return ok(record);
  }

  async findMany(query: AuditLogQueryParam): Promise<PaginatedResult<AuditLog>> {
    const where = this.buildWhereInput(query);
    const { page, limit } = query;

    const [items, totalItems] = await Promise.all([
      this.delegate.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { occurredAt: 'desc' }, // 최신순 기본 정렬
      }),
      this.delegate.count({ where }),
    ]);

    return createPaginatedResult({
      items,
      totalItems: totalItems,
      options: {
        page,
        limit,
      },
    });
  }

  async count(filter: AuditLogFilterOptions): Promise<number> {
    return this.delegate.count({
      where: this.buildWhereInput(filter),
    });
  }

  async findRetentionCandidates(olderThan: Date, limit: number): Promise<AuditLog[]> {
    return this.delegate.findMany({
      where: {
        occurredAt: {
          lt: olderThan,
        },
      },
      take: limit,
      orderBy: { occurredAt: 'asc' }, // 가장 오래된 로그부터 처리 (삭제/아카이빙 용이)
    });
  }

  private buildWhereInput(filter: AuditLogFilterOptions): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (filter.actorId) {
      where.actorId = filter.actorId;
    }

    if (filter.targetType) {
      where.targetType = filter.targetType;
    }

    if (filter.targetId) {
      where.targetId = filter.targetId;
    }

    if (filter.eventCode) {
      where.eventCode = filter.eventCode;
    }

    if (filter.correlationId) {
      where.correlationId = filter.correlationId;
    }

    if (filter.ipAddress) {
      where.ipAddress = filter.ipAddress;
    }

    if (filter.occurredAt) {
      where.occurredAt = {};
      if (filter.occurredAt.from) {
        where.occurredAt.gte = filter.occurredAt.from;
      }
      if (filter.occurredAt.to) {
        where.occurredAt.lte = filter.occurredAt.to;
      }
    }

    return where;
  }
}
