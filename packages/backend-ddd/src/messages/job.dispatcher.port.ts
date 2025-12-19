import { AbstractJob, AbstractJobProps } from './abstract.job';

export abstract class JobDispatcherPort {
  abstract dispatch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    job: AbstractJob<string, string, string, AbstractJobProps<any>, unknown>,
  ): Promise<void>;
  abstract dispatchMany(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobs: AbstractJob<string, string, string, AbstractJobProps<any>, unknown>[],
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
