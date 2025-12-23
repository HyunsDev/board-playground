import { Logger } from '@nestjs/common';
import { ok } from 'neverthrow';
import z from 'zod';

import { matchError, PlainMessage } from '@workspace/backend-ddd';
import { asJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

import { AuditLogRepositoryPort } from './audit-log.repository.port';

import { BaseDomainEvent, BaseDomainEventProps, BaseJob, BaseJobProps, IJobHandler } from '@/base';
import { JobHandler } from '@/modules/messaging';

const AuditLogJobSchema = z.object({
  plainEvent: z.any(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

type AuditLogJobProps = BaseJobProps<{
  plainEvent: PlainMessage<BaseDomainEvent<BaseDomainEventProps<unknown>>>;
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
      data: { plainEvent, ipAddress, userAgent, sessionId },
    } = job;

    const result = await this.auditLogRepository.create({
      actorId: plainEvent.metadata.userId ?? null,
      targetType: plainEvent.metadata.resourceType || 'unknown',
      targetId: plainEvent.metadata.resourceId ?? null,
      eventCode: plainEvent.code,
      correlationId: plainEvent.metadata.correlationId ?? null,
      ipAddress: ipAddress ?? null,
      data: plainEvent.data ?? {},
      metadata: {
        causationId: plainEvent.metadata.causationId,
        causationType: plainEvent.metadata.causationType,
        userAgent: userAgent ?? null,
        sessionId: sessionId ?? null,
      },
      occurredAt: plainEvent.metadata.createdAt
        ? new Date(plainEvent.metadata.createdAt)
        : undefined,
    });

    if (result.isErr()) return matchError(result.error, {});

    this.logger.log(`Audit log recorded for event code: ${plainEvent.code}`);
    return ok(undefined);
  }
}
