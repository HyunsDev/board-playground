import { Logger } from '@nestjs/common';
import { ok } from 'neverthrow';
import z from 'zod';

import { matchError } from '@workspace/backend-ddd';
import { asJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

import { AuditLogRepositoryPort } from './audit-log.repository.port';

import { BaseDomainEvent, BaseDomainEventProps, BaseJob, BaseJobProps, IJobHandler } from '@/base';
import { JobHandler } from '@/modules/messaging';

const AuditLogJobSchema = z.object({
  event: z.any(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

type AuditLogJobProps = BaseJobProps<{
  event: BaseDomainEvent<BaseDomainEventProps<unknown>>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}>;

export class AuditLogJob extends BaseJob<AuditLogJobProps> {
  static readonly code = asJobCode('system:audit_log:job:record');
  readonly queueName = TaskQueueCodeEnum.System.AuditLog;
  readonly resourceType = DomainCodeEnums.System.AuditLog;
  get schema() {
    return AuditLogJobSchema;
  }
}

@JobHandler(AuditLogJob)
export class AuditLogJobHandler implements IJobHandler<AuditLogJob> {
  private readonly logger = new Logger(AuditLogJobHandler.name);
  constructor(private readonly auditLogRepository: AuditLogRepositoryPort) {}

  async execute(job: AuditLogJob) {
    const {
      data: { event, ipAddress, userAgent, sessionId },
    } = job;

    const result = await this.auditLogRepository.create({
      actorId: event.metadata.userId ?? null,
      targetType: event.metadata.resourceType || 'unknown',
      targetId: event.metadata.resourceId ?? null,
      eventCode: event.code,
      correlationId: event.metadata.correlationId ?? null,
      ipAddress: ipAddress ?? null,
      data: event.data ?? {},
      metadata: {
        causationId: event.metadata.causationId,
        causationType: event.metadata.causationType,
        userAgent: userAgent ?? null,
        sessionId: sessionId ?? null,
      },
      occurredAt: event.metadata.createdAt ? new Date(event.metadata.createdAt) : undefined,
    });

    if (result.isErr()) return matchError(result.error, {});

    this.logger.log(`Audit log recorded for event code: ${event.code}`);
    return ok(undefined);
  }
}
