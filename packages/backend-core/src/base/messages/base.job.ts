import { JobsOptions } from 'bullmq';

import { AbstractJobProps, AbstractJob } from '@workspace/backend-ddd';
import { JobCode, Id, TaskQueueCode } from '@workspace/domain';

import { DrivenMessageMetadata } from './message-metadata';
import { BaseMessageGenerics } from './message.types';

export type BaseJobProps<T> = AbstractJobProps<T>;

export abstract class BaseJob<TProps extends BaseJobProps<unknown>> extends AbstractJob<
  BaseMessageGenerics<JobCode>,
  TProps,
  JobsOptions
> {
  abstract readonly queueName: TaskQueueCode;
  static readonly code: JobCode;

  get options(): JobsOptions {
    return {
      jobId: this.id,
      ...this._options,
    };
  }

  constructor(
    resourceId: Id | null,
    data: TProps['data'],
    metadata?: DrivenMessageMetadata,
    options?: JobsOptions,
  ) {
    super(resourceId, data, metadata, options);
  }
}
