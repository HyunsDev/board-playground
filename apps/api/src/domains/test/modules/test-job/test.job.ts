import { Logger } from '@nestjs/common';
import { ok } from 'neverthrow';
import z from 'zod';

import {
  BaseJob,
  BaseJobProps,
  IJobHandler,
  JobHandler,
  systemLog,
  SystemLogActionEnum,
} from '@workspace/backend-core';
import { asJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

const TestJobSchema = z.object({
  message: z.string(),
});

export type TestJobProps = BaseJobProps<{
  message: string;
}>;

export class TestJob extends BaseJob<TestJobProps> {
  static readonly code = asJobCode('system:test:job:test');
  readonly resourceType = DomainCodeEnums.System.Test;
  readonly queueName = TaskQueueCodeEnum.System.Test;
  get schema() {
    return TestJobSchema;
  }
}

@JobHandler(TestJob)
export class TestJobHandler implements IJobHandler<TestJob> {
  private readonly logger = new Logger(TestJobHandler.name);

  async execute(job: TestJob) {
    const { message } = job.data;
    this.logger.log(
      systemLog(DomainCodeEnums.System.Test, SystemLogActionEnum.Test, {
        msg: `Job: ${message}`,
      }),
    );
    return ok(undefined);
  }
}
