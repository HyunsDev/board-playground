// packages/backend-core/src/modules/task-queue/decorators/task-processor.decorator.ts

import { Processor, ProcessorOptions } from '@nestjs/bullmq';

import { TaskQueueCode } from '@workspace/domain';

import { toSafeQueueName } from '../task-queue.utils';

export const TaskProcessor = (queueCode: TaskQueueCode, options: ProcessorOptions = {}) => {
  const safeName = toSafeQueueName(queueCode);
  return Processor(safeName, options);
};
