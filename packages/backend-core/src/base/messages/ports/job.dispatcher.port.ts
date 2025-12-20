import { BaseJob, BaseJobProps } from '../base.job';

export abstract class JobDispatcherPort {
  abstract dispatch(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    job: BaseJob<BaseJobProps<any>>,
  ): Promise<void>;
  abstract dispatchMany(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobs: BaseJob<BaseJobProps<any>>[],
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
