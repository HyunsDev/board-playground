import { DirectRepositoryPort, DomainResult } from '@workspace/backend-ddd';
import { PaginatedResult } from '@workspace/common';
import { AuditLog } from '@workspace/database';

import { AuditLogNotFoundError } from './audit-log.errors';
import { AuditLogFilterOptions, AuditLogQueryParam } from './audit.log.types';

export interface CreateAuditLogParam {
  actorId?: string | null;
  targetType: string;
  targetId?: string | null;
  eventCode: string;
  correlationId?: string | null;
  ipAddress?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Prisma Json 호환 (object | any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any | null;
  occurredAt?: Date; // 지정하지 않으면 DB default(now()) 사용
}

export abstract class AuditLogRepositoryPort extends DirectRepositoryPort<AuditLog> {
  abstract create(param: CreateAuditLogParam): Promise<DomainResult<AuditLog, never>>;
  abstract createMany(params: CreateAuditLogParam[]): Promise<DomainResult<void, never>>;

  abstract getOneById(id: string): Promise<DomainResult<AuditLog, AuditLogNotFoundError>>;
  abstract findMany(query: AuditLogQueryParam): Promise<PaginatedResult<AuditLog>>;
  abstract count(filter: AuditLogFilterOptions): Promise<number>;
  abstract findRetentionCandidates(olderThan: Date, limit: number): Promise<AuditLog[]>;
}
