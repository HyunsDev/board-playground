import { AbstractMessageMetadata } from './abstract-message-metadata.type';
import { AbstractJob, AbstractJobProps } from './abstract.job';

export interface IJobConstructor<T extends AbstractJob> {
  new (...args: any[]): T;
  fromPlain(plain: {
    id: string;
    code: string;
    data: unknown;
    metadata: AbstractMessageMetadata;
  }): T;
}

export interface IJobHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TJob extends AbstractJob<string, string, string, AbstractJobProps<string, string, any>, any>,
> {
  readonly JobClass: IJobConstructor<TJob>;
  execute(job: TJob): Promise<void>;
}
