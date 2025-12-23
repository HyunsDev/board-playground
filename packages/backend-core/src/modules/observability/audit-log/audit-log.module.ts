import { Module } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { AuditLogCollector } from './audit-log.collector';
import { AuditLogJob } from './audit-log.job';
import { AuditLogProcessor } from './audit-log.processor';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogRepositoryPort } from './audit-log.repository.port';
import { AuditLogService } from './audit-log.service';

import { TaskQueueModule } from '@/modules/messaging';

@Module({
  imports: [
    TaskQueueModule.forFeature({
      queue: {
        name: TaskQueueCodeEnum.System.AuditLog,
      },
    }),
  ],
  providers: [
    AuditLogCollector,
    AuditLogJob,
    AuditLogProcessor,
    {
      provide: AuditLogRepositoryPort,
      useClass: AuditLogRepository,
    },
    AuditLogService,
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
