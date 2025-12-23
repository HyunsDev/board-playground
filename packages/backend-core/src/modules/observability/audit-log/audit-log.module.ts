import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { AuditLogCollector } from './audit-log.collector';
import { AuditLogJobHandler } from './audit-log.job';
import { AuditLogProcessor } from './audit-log.processor';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogRepositoryPort } from './audit-log.repository.port';
import { AuditLogService } from './audit-log.service';

import { TaskQueueModule } from '@/modules/messaging/task-queue';

@Global()
@Module({
  imports: [
    CqrsModule,
    TaskQueueModule.forFeature({
      queue: {
        name: TaskQueueCodeEnum.System.AuditLog,
      },
    }),
  ],
  providers: [
    AuditLogJobHandler,
    AuditLogProcessor,
    {
      provide: AuditLogRepositoryPort,
      useClass: AuditLogRepository,
    },
    AuditLogService,
    AuditLogCollector,
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
