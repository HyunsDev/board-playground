import { Injectable } from '@nestjs/common';
import { v7 } from 'uuid';

import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
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
    super(prisma, txContext);
  }

  protected get delegate(): PrismaClient['auditLog'] {
    return this.client.auditLog;
  }

  create(param: CreateAuditLogParam) {
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

    return this.createRecord({
      data: item,
    }).mapErr((e) =>
      matchError(e, {
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  createMany(params: CreateAuditLogParam[]) {
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

    return this.createManyRecords({
      data: items,
    })
      .mapErr((e) =>
        matchError(e, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
      )
      .map(() => undefined);
  }

  getOneById(id: string) {
    return this.getUniqueRecord({ where: { id } }).mapErr((e) =>
      matchError(e, {
        EntityNotFound: () => new AuditLogNotFoundError(id),
      }),
    );
  }

  findMany(query: AuditLogQueryParam) {
    return this.findManyPaginatedRecords(
      {
        where: this.buildWhereInput(query),
      },
      query,
    );
  }

  count(filter: AuditLogFilterOptions) {
    return this.countRecords(this.buildWhereInput(filter));
  }

  findRetentionCandidates(olderThan: Date, limit: number) {
    return this.findManyRecords({
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
