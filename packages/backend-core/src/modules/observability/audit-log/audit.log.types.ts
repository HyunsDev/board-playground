import { PaginationQuery } from '@workspace/common';

export interface AuditLogFilterOptions {
  actorId?: string | null; // 누가
  targetType?: string | null; // 무엇을 (타입)
  targetId?: string | null; // 무엇을 (ID)
  eventCode?: string | null; // 무슨 이벤트를
  correlationId?: string | null; // 요청 추적 ID
  ipAddress?: string | null; // 특정 IP 검색

  // 기간 조회 (Range)
  occurredAt?: {
    from?: Date;
    to?: Date;
  };
}

export type AuditLogQueryParam = PaginationQuery<AuditLogFilterOptions>;
