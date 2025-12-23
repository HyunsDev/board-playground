import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { TaskQueueCode } from '@workspace/domain';

import { QueueRegistry } from './queue.registry';

import { BaseJob, BaseJobProps } from '@/base';
import { JobDispatcherPort } from '@/base/messages/ports/job.dispatcher.port';
import { MessageContext, OutboxContext, TransactionContext } from '@/modules/foundation/context';

@Injectable()
export class JobDispatcher implements JobDispatcherPort {
  constructor(
    private readonly queueRegistry: QueueRegistry,
    private readonly txContext: TransactionContext,
    private readonly messageContext: MessageContext,
    private readonly outbox: OutboxContext,
  ) {}

  async dispatch(job: BaseJob<BaseJobProps<unknown>>): Promise<void> {
    this.outbox.jobStore.push(job);
    // 트랜잭션이 활성화되어 있지 않다면 즉시 발행
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  async dispatchMany(jobs: BaseJob<BaseJobProps<unknown>>[]): Promise<void> {
    this.outbox.jobStore.push(...jobs);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.outbox.jobStore.clear();
  }

  async flush(): Promise<void> {
    if (this.outbox.jobStore.length() === 0) return;
    const jobs = this.outbox.jobStore.list();

    // 1. Context에서 메타데이터(TraceId, UserId 등) 가져오기
    const metadata = this.messageContext.drivenMetadata;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobsByQueue = new Map<TaskQueueCode, BaseJob<any>[]>();

    for (const job of jobs) {
      if (metadata) {
        job.updateMetadata(metadata);
      }

      const { queueName } = job;
      if (!jobsByQueue.has(queueName)) {
        jobsByQueue.set(queueName, []);
      }
      jobsByQueue.get(queueName)!.push(job);
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
