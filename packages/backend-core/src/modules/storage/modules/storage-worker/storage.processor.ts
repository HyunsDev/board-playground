import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { CleanUpOrphanFilesJobHandler } from './jobs/clean-up-orphan-files.job';

import { CoreContext } from '@/modules/context';
import { Processor } from '@/modules/task-queue/decorators';
import { JobProcessor } from '@/modules/task-queue/job.processor';

@Processor(TaskQueueCodeEnum.System.Storage)
export class StorageProcessor extends JobProcessor {
  constructor(
    readonly cleanUpOrphanFilesJobHandler: CleanUpOrphanFilesJobHandler,
    readonly coreContext: CoreContext,
  ) {
    const logger = new Logger(StorageProcessor.name);
    super(coreContext, logger, [cleanUpOrphanFilesJobHandler]);
  }
}
