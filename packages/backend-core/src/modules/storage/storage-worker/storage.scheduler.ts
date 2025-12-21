// packages/backend-core/src/modules/storage/storage-gc/storage.scheduler.ts

import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { TaskQueueCodeEnum } from '@workspace/domain';
import { TriggerCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJob } from './jobs/clean-up-orphan-files.job';

import { DrivenMessageMetadata } from '@/base';
import { MessageContext } from '@/modules/foundation/context';
import { InjectTaskQueue } from '@/modules/messaging/task-queue/decorators';

@Injectable()
export class StorageScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(StorageScheduler.name);

  constructor(
    @InjectTaskQueue(TaskQueueCodeEnum.System.Storage) private readonly storageQueue: Queue,
    private readonly messageContext: MessageContext,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing Storage GC Scheduler');

    const schedulers = await this.storageQueue.getJobSchedulers();

    for (const scheduler of schedulers) {
      if (scheduler.name === CleanUpOrphanFilesJob.code) {
        await this.storageQueue.removeJobScheduler(scheduler.key);
      }
    }

    const metadata: DrivenMessageMetadata = {
      causationId: null,
      causationType: TriggerCodeEnum.Scheduler,
      correlationId: null,
      userId: null,
    };

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
