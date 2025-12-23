import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { AuditLogJobHandler } from './audit-log.job';

import { CoreContext } from '@/modules/foundation';
import { JobProcessor, Processor } from '@/modules/messaging';

@Processor(TaskQueueCodeEnum.System.AuditLog)
export class AuditLogProcessor extends JobProcessor {
  constructor(
    readonly coreContext: CoreContext,
    readonly auditLogJobHandler: AuditLogJobHandler,
  ) {
    const logger = new Logger(AuditLogProcessor.name);
    super(coreContext, logger, [auditLogJobHandler]);
  }
}
