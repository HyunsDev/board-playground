import { JobsOptions } from 'bullmq';

import { AbstractJobProps, AbstractJob } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, JobCode } from '@workspace/domain';

export type BaseJobProps<T> = AbstractJobProps<CausationCode, DomainCode, T>;

export abstract class BaseJob<TProps extends BaseJobProps<unknown>> extends AbstractJob<
  CausationCode,
  DomainCode,
  JobCode,
  TProps,
  JobsOptions
> {
  get options(): JobsOptions {
    return {
      jobId: this.id,
      ...this._options,
    };
  }
}
