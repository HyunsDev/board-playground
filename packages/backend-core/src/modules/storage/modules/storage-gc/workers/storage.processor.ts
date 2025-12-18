import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJobHandler } from './clean-up-orphan-files.handler';

import { JobProcessor } from '@/modules/task-queue/job.processor';

@Processor(TaskQueueCodeEnum.System.Storage as string)
export class StorageProcessor extends JobProcessor {
  constructor(readonly cleanUpOrphanFilesJobHandler: CleanUpOrphanFilesJobHandler) {
    const logger = new Logger(StorageProcessor.name);
    super(logger, [cleanUpOrphanFilesJobHandler]);
  }
}
