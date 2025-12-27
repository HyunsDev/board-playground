import { Injectable } from '@nestjs/common';

import { AuditLogRepositoryPort } from './audit-log.repository.port';
import { AuditLogFilterOptions, AuditLogQueryParam } from './audit.log.types';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepositoryPort) {}

  getOneById(id: string) {
    return this.auditLogRepository.getOneById(id);
  }

  findMany(query: AuditLogQueryParam) {
    return this.auditLogRepository.findMany(query);
  }

  count(filter: AuditLogFilterOptions) {
    return this.auditLogRepository.count(filter);
  }

  findRetentionCandidates(olderThan: Date, limit: number) {
    return this.auditLogRepository.findRetentionCandidates(olderThan, limit);
  }
}
