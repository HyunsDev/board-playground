// packages/backend-core/src/modules/storage/storage-gc/storage.scheduler.ts

import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJob } from './jobs/clean-up-orphan-files.job';

import { TriggerCodeEnum } from '@/common';
import { ContextService } from '@/modules/context';
import { InjectTaskQueue } from '@/modules/task-queue/decorators';

@Injectable()
export class StorageScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(StorageScheduler.name);

  constructor(
    @InjectTaskQueue(TaskQueueCodeEnum.System.Storage) private readonly storageQueue: Queue,
    private readonly contextService: ContextService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing Storage GC Scheduler');

    const schedulers = await this.storageQueue.getJobSchedulers();

    for (const scheduler of schedulers) {
      if (scheduler.name === CleanUpOrphanFilesJob.code) {
        await this.storageQueue.removeJobScheduler(scheduler.key);
      }
    }

    const metadata = this.contextService.getNewMessageMetadata(TriggerCodeEnum.Scheduler);

    await this.storageQueue.add(
      CleanUpOrphanFilesJob.code,
      new CleanUpOrphanFilesJob(null, {}, metadata),
      {
        repeat: {
          pattern: '0 4 * * *',
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log('Storage GC Scheduler registered: Daily at 04:00');
  }
}
