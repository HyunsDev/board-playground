import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJobHandler } from './jobs/clean-up-orphan-files.job';

import { Processor } from '@/modules/task-queue/decorators';
import { JobProcessor } from '@/modules/task-queue/job.processor';

@Processor(TaskQueueCodeEnum.System.Storage)
export class StorageProcessor extends JobProcessor {
  constructor(readonly cleanUpOrphanFilesJobHandler: CleanUpOrphanFilesJobHandler) {
    const logger = new Logger(StorageProcessor.name);
    super(logger, [cleanUpOrphanFilesJobHandler]);
  }
}
