import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';

import { TaskQueueCode } from '@workspace/domain';

import { TaskQueueNotFoundException } from './task-queue.exceptions';
import { toSafeQueueName } from './task-queue.utils';

@Injectable()
export class QueueRegistry {
  private readonly queues = new Map<TaskQueueCode, Queue>();

  constructor(private readonly moduleRef: ModuleRef) {}

  getQueue(code: TaskQueueCode): Queue {
    try {
      if (this.queues.has(code)) {
        return this.queues.get(code)!;
      }

      const queue = this.moduleRef.get<Queue>(getQueueToken(toSafeQueueName(code)), {
        strict: false,
      });
      if (!queue) {
        throw new TaskQueueNotFoundException(code);
      }

      this.queues.set(code, queue);
      return queue;
    } catch (error) {
      if (error instanceof TaskQueueNotFoundException) {
        throw error;
      }
      throw new TaskQueueNotFoundException(code, error);
    }
  }
}
