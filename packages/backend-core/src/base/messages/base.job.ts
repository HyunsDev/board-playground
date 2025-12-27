import { JobsOptions } from 'bullmq';

import { AbstractJobProps, AbstractJob } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, JobCode, ModelId, TaskQueueCode } from '@workspace/domain';

import { DrivenMessageMetadata } from './message-metadata';

export type BaseJobProps<T> = AbstractJobProps<T>;

export abstract class BaseJob<TProps extends BaseJobProps<unknown>> extends AbstractJob<
  CausationCode,
  DomainCode,
  JobCode,
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
    resourceId: ModelId | null,
    data: TProps['data'],
    metadata?: DrivenMessageMetadata,
    options?: JobsOptions,
  ) {
    super(resourceId, data, metadata, options);
  }
}
