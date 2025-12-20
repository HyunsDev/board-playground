import { Module } from '@nestjs/common';

import { TaskQueueModule } from '@workspace/backend-core';
import { TaskQueueCodeEnum } from '@workspace/domain';

import { TestJobController } from './test-job.controller';
import { TestJobHandler } from './test.job';
import { TestProcessor } from './test.processor';

@Module({
  imports: [
    TaskQueueModule.forFeature({
      queue: {
        name: TaskQueueCodeEnum.System.Test,
      },
    }),
  ],
  providers: [TestJobHandler, TestProcessor],
  controllers: [TestJobController],
})
export class TestJobModule {}
