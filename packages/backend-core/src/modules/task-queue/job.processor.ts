import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common'; // 혹은 커스텀 LoggerPort
import { Job } from 'bullmq';

import { IJobHandler, InvalidMessageException } from '@workspace/backend-ddd';

import { JobCodeMismatchException } from './job.errors';

import { BaseJob, BaseJobProps } from '@/base';

export abstract class JobProcessor extends WorkerHost {
  // 제네릭 제거: 내부 구현에서는 구체적인 타입을 몰라도 Map으로 관리 가능
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly handlers = new Map<string, IJobHandler<any>>();

  constructor(
    protected readonly logger: Logger, // LoggerPort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: IJobHandler<BaseJob<BaseJobProps<any>>>[],
  ) {
    super();
    // 핸들러 매핑 초기화
    for (const handler of handlers) {
      if (this.handlers.has(handler.JobClass.code)) {
        this.logger.warn(`Duplicate handler found for jobCode: ${handler.JobClass.code}`);
      }
      this.handlers.set(handler.JobClass.code, handler);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async process(bullJob: Job<any, any, string>): Promise<void> {
    const jobCode = bullJob.name; // BullMQ의 jobName을 code로 사용
    const handler = this.handlers.get(jobCode);

    // 1. 핸들러 존재 여부 확인
    if (!handler) {
      // 핸들러가 없으면 처리할 수 없음.
      // 등록된 모든 코드 목록을 에러 메시지에 포함 (디버깅 용)
      const registeredCodes = Array.from(this.handlers.keys()).join(', ');
      throw new JobCodeMismatchException(jobCode, registeredCodes);
    }

    try {
      this.logger.log(`[${jobCode}] Processing job ${bullJob.id}...`);

      // 2. [핵심] Raw Data -> Job Instance 변환 (fromPlain + Validation)
      // 핸들러가 가지고 있는 JobClass 정보를 이용해 정적 메서드 호출
      const jobInstance = handler.JobClass.fromPlain({
        id: bullJob.data.id,
        code: jobCode,
        data: bullJob.data.data,
        metadata: bullJob.data.metadata, // 우리가 메타데이터를 opts에 넣었다면 이렇게 복원
        // 혹은 metadata가 data 안에 포함되어 있다면 bullJob.data.metadata
      });

      // 3. 실제 비즈니스 로직 실행
      await handler.execute(jobInstance);

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
