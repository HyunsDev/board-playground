import { AbstractJob, AbstractJobProps } from './abstract.job';
import { MessageConstructor } from './abstract.message';

import { DomainError, DomainResult } from '@/error';

export interface IJobHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TJob extends AbstractJob<string, string, string, AbstractJobProps<any>, any>,
> {
  readonly JobClass: MessageConstructor<TJob>;
  execute(job: TJob): Promise<DomainResult<void | DomainError>>;
}
