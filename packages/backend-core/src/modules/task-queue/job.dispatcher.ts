import { getQueueToken } from '@nestjs/bullmq';
import { Injectable, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';

import { JobDispatcherPort, InternalServerErrorException } from '@workspace/backend-ddd';
import { TaskQueueCode } from '@workspace/domain';

import { toSafeQueueName } from './task-queue.utils';
import { ContextService } from '../context/context.service';

import { BaseJob, BaseJobProps } from '@/base';

@Injectable({ scope: Scope.REQUEST }) // 요청(트랜잭션) 단위로 상태를 유지해야 하므로 REQUEST 스코프 필수
export class JobDispatcher implements JobDispatcherPort {
  private jobs: BaseJob<BaseJobProps<unknown>>[] = [];
  private queues = new Map<string, Queue>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly contextService: ContextService,
  ) {}

  async dispatch(job: BaseJob<BaseJobProps<unknown>>): Promise<void> {
    this.jobs.push(job);
    // 트랜잭션이 활성화되어 있지 않다면 즉시 발행
    if (!this.contextService.isTransactionActive()) {
      await this.flush();
    }
  }

  async dispatchMany(jobs: BaseJob<BaseJobProps<unknown>>[]): Promise<void> {
    this.jobs.push(...jobs);
    if (!this.contextService.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.jobs = [];
  }

  async flush(): Promise<void> {
    if (this.jobs.length === 0) return;

    // 1. Context에서 메타데이터(TraceId, UserId 등) 가져오기
    // (ContextService 리팩토링 때 정의한 getMessageMetadata 사용)
    const metadata = this.contextService.getMessageMetadata();

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
    if (this.queues.has(name)) return this.queues.get(name)!;
    try {
      const queue = this.moduleRef.get<Queue>(getQueueToken(toSafeQueueName(name)), {
        strict: false,
      });
      this.queues.set(name, queue);
      return queue;
    } catch {
      throw new InternalServerErrorException(`Queue with name "${name}" not found`);
    }
  }
}
