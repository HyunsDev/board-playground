import { Controller, Get, Logger } from '@nestjs/common';

import { JobDispatcherPort, MessageContext, Public, Trigger } from '@workspace/backend-core';
import { TriggerCodeEnum } from '@workspace/domain';

import { TestJob } from './test.job';

@Public()
@Controller('_test')
export class TestJobController {
  readonly logger = new Logger(TestJobController.name);

  constructor(
    private readonly messageContext: MessageContext,
    private readonly jobDispatcher: JobDispatcherPort,
  ) {}

  @Get('job')
  @Trigger(TriggerCodeEnum.Http)
  async job() {
    void this.jobDispatcher.dispatch(
      new TestJob(null, {
        message: '쭈아아아압',
      }),
    );
  }
}
