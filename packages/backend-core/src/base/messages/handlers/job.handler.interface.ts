import { DomainError, DomainResult, MessageConstructor } from '@workspace/backend-ddd';

import { BaseJob, BaseJobProps } from '../messages';

export interface IJobHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TJob extends BaseJob<BaseJobProps<any>>,
> {
  readonly JobClass: MessageConstructor<TJob>;
  execute(job: TJob): Promise<DomainResult<void, DomainError>>;
}
