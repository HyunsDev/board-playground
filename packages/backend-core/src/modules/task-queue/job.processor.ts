/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { InvalidMessageException, MessageConstructor } from '@workspace/backend-ddd';

import { JOB_HANDLER_METADATA } from './job.contants';
import { JobCodeMismatchException } from './job.exceptions';
import { CoreContext } from '../context';

import { BaseJob, BaseJobProps, IJobHandler } from '@/base';

export abstract class JobProcessor extends WorkerHost {
  protected readonly handlers = new Map<
    string,
    {
      handler: IJobHandler<any>;
      jobClass: MessageConstructor<BaseJob<any>>;
    }
  >();

  constructor(
    protected readonly coreContext: CoreContext,
    protected readonly logger: Logger,

    handlers: IJobHandler<BaseJob<BaseJobProps<any>>>[],
  ) {
    super();
    this.registerHandlers(handlers);
  }

  private registerHandlers(handlers: IJobHandler<any>[]) {
    for (const handler of handlers) {
      const jobClass = Reflect.getMetadata(JOB_HANDLER_METADATA, handler.constructor) as
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
      this.handlers.set(jobCode, {
        handler,
        jobClass,
      });
    }
  }

  async process(bullJob: Job<any, any, string>): Promise<void> {
    return this.coreContext.run(async () => {
      const jobCode = bullJob.name; // BullMQ의 jobName을 code로 사용
      const handler = this.handlers.get(jobCode);

      if (!handler) {
        const registeredCodes = Array.from(this.handlers.keys()).join(', ');
        throw new JobCodeMismatchException(jobCode, registeredCodes);
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const jobInstance = handler.jobClass.fromPlain(bullJob.data);
        if (!jobInstance.metadata.correlationId) {
          throw new InvalidMessageException('Job metadata must include a correlationId.');
        }

        this.coreContext.setRequestId(jobInstance.metadata.correlationId);

        // 3. 실제 비즈니스 로직 실행
        await handler.handler.execute(jobInstance);
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
    });
  }
}
