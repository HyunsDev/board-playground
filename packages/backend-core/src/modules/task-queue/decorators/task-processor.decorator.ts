import { Processor as NestProcessor, ProcessorOptions } from '@nestjs/bullmq';
import { applyDecorators } from '@nestjs/common';

import { TaskQueueCode } from '@workspace/domain';

import { toSafeQueueName } from '../task-queue.utils';

export const Processor = (queueCode: TaskQueueCode, options: ProcessorOptions = {}) => {
  const safeName = toSafeQueueName(queueCode);

  return applyDecorators(NestProcessor(safeName, options));
};
