import { AbstractJob, AbstractJobProps } from './abstract.job';

export interface IJobHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TJob extends AbstractJob<string, string, string, AbstractJobProps<string, string, any>>,
> {
  jobCode: string;
  execute(job: TJob): Promise<void>;
}
