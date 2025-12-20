import { DomainError, DomainResult } from '@workspace/backend-ddd';

import { BaseJob, BaseJobProps } from '../messages';

export interface IJobHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TJob extends BaseJob<BaseJobProps<any>>,
> {
  execute(job: TJob): Promise<DomainResult<void, DomainError>>;
}
