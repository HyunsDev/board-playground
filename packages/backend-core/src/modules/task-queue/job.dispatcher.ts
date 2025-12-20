import { Injectable, Scope } from '@nestjs/common';
import { Queue } from 'bullmq';

import { AbstractJobDispatcherPort } from '@workspace/backend-ddd';
import { TaskQueueCode } from '@workspace/domain';

import { MessageContext, TransactionContext } from '../context';
import { QueueRegistry } from './queue.registry';

import { BaseJob, BaseJobProps } from '@/base';

@Injectable({ scope: Scope.REQUEST }) // 요청(트랜잭션) 단위로 상태를 유지해야 하므로 REQUEST 스코프 필수
export class JobDispatcher implements AbstractJobDispatcherPort {
  private jobs: BaseJob<BaseJobProps<unknown>>[] = [];

  constructor(
    private readonly queueRegistry: QueueRegistry,
    private readonly txContext: TransactionContext,
    private readonly messageContext: MessageContext,
  ) {}

  async dispatch(job: BaseJob<BaseJobProps<unknown>>): Promise<void> {
    this.jobs.push(job);
    // 트랜잭션이 활성화되어 있지 않다면 즉시 발행
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  async dispatchMany(jobs: BaseJob<BaseJobProps<unknown>>[]): Promise<void> {
    this.jobs.push(...jobs);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.jobs = [];
  }

  async flush(): Promise<void> {
    if (this.jobs.length === 0) return;

    // 1. Context에서 메타데이터(TraceId, UserId 등) 가져오기
    const metadata = this.messageContext.drivenMetadata;

    const jobsByQueue = new Map<TaskQueueCode, BaseJob<BaseJobProps<unknown>>[]>();

    for (const job of this.jobs) {
      if (metadata) {
        job.updateMetadata(metadata);
      }

      const { queueName } = job;
      if (!jobsByQueue.has(queueName)) {
        jobsByQueue.set(queueName, []);
      }
      jobsByQueue.get(queueName)!.push(job);
    }

    // 2. 모든 메세지에 메타데이터 주입 (Causation 추적용)
    if (metadata) {
      this.jobs.forEach((job) => job.updateMetadata(metadata));
    }

    await Promise.all(
      Array.from(jobsByQueue.entries()).map(async ([queueName, jobs]) => {
        const queue = this.getQueue(queueName);

        const bulkJobs = jobs.map((job) => {
          const jobPlain = job.toPlain();

          return {
            name: job.code,
            data: jobPlain,
            opts: job.options,
          };
        });

        return queue.addBulk(bulkJobs);
      }),
    );

    // 4. 버퍼 비우기
    this.clear();
  }

  private getQueue(name: TaskQueueCode): Queue {
    return this.queueRegistry.getQueue(name);
  }
}
