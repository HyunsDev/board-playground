import { Logger } from '@nestjs/common';

import { CoreContext, JobProcessor, Processor } from '@workspace/backend-core';
import { TaskQueueCodeEnum } from '@workspace/domain';

import { TestJobHandler } from './test.job';

@Processor(TaskQueueCodeEnum.System.Test)
export class TestProcessor extends JobProcessor {
  constructor(
    readonly testJobHandler: TestJobHandler,
    readonly coreContext: CoreContext,
  ) {
    const logger = new Logger(TestProcessor.name);
    super(coreContext, logger, [testJobHandler]);
  }
}
