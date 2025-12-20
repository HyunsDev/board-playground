import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { InvalidMessageException, MessageConstructor } from '@workspace/backend-ddd';

import { JOB_HANDLER_METADATA } from './job.contants';
import { JobCodeMismatchException } from './job.errors';

import { BaseJob, BaseJobProps, IJobHandler } from '@/base';

export abstract class JobProcessor extends WorkerHost {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly handlers = new Map<string, IJobHandler<any>>();

  constructor(
    protected readonly logger: Logger,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: IJobHandler<BaseJob<BaseJobProps<any>>>[],
  ) {
    super();
    this.registerHandlers(handlers);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private registerHandlers(handlers: IJobHandler<any>[]) {
    for (const handler of handlers) {
      const jobClass = Reflect.getMetadata(JOB_HANDLER_METADATA, handler.constructor) as  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | MessageConstructor<BaseJob<any>>
        | undefined;

      if (!jobClass) {
        this.logger.error(
          `Handler ${handler.constructor.name} has no mapped JobClass. Did you forget @HandleJob decorator?`,
        );
        continue;
      }

      // 3. JobClass의 static property인 code를 가져옴
      const jobCode = jobClass.code;

      if (this.handlers.has(jobCode)) {
        this.logger.warn(`Duplicate handler found for jobCode: ${jobCode}`);
      }

      this.logger.log(`Registered JobHandler: ${handler.constructor.name} for [${jobCode}]`);
      this.handlers.set(jobCode, handler);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async process(bullJob: Job<any, any, string>): Promise<void> {
    const jobCode = bullJob.name; // BullMQ의 jobName을 code로 사용
    const handler = this.handlers.get(jobCode);

    if (!handler) {
      const registeredCodes = Array.from(this.handlers.keys()).join(', ');
      throw new JobCodeMismatchException(jobCode, registeredCodes);
    }

    try {
      this.logger.log(`[${jobCode}] Processing job ${bullJob.id}...`);

      // 3. 실제 비즈니스 로직 실행
      await handler.execute(bullJob.data);

      this.logger.log(`[${jobCode}] Job ${bullJob.id} completed.`);
    } catch (error) {
      if (error instanceof JobCodeMismatchException) {
        this.logger.error(
          `[${jobCode}] Job ${bullJob.id} failed due to code mismatch: ${error.message}`,
        );
      }

      if (error instanceof InvalidMessageException) {
        this.logger.error(
          `[${jobCode}] Job ${bullJob.id} failed due to invalid message: ${error.message}`,
        );
      }

      if (error instanceof Error) {
        this.logger.error(`[${jobCode}] Job ${bullJob.id} failed: ${error.message}`, error.stack);
        throw error; // BullMQ가 재시도(Retry) 할 수 있도록 에러를 다시 던짐
      }
      this.logger.error(`[${jobCode}] Job ${bullJob.id} failed: ${error}`, error);
      throw error; // BullMQ가 재시도(Retry) 할 수 있도록 에러를 다시 던짐
    }
  }
}
