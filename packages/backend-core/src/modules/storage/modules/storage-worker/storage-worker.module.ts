import { Module } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJobHandler } from './jobs/clean-up-orphan-files.job';
import { StorageProcessor } from './storage.processor';
import { StorageScheduler } from './storage.scheduler';
import { StorageModule } from '../storage/storage.module';

import { TaskQueueModule } from '@/modules/task-queue';

@Module({
  imports: [
    StorageModule,
    TaskQueueModule.forFeature({ queue: { name: TaskQueueCodeEnum.System.Storage } }),
  ],
  providers: [StorageProcessor, CleanUpOrphanFilesJobHandler, StorageScheduler],
})
export class StorageWorkerModule {}
