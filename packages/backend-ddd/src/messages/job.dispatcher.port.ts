import { AbstractJob } from './abstract.job';

export abstract class JobDispatcherPort {
  abstract dispatch(job: AbstractJob): Promise<void>;
  abstract dispatchMany(jobs: AbstractJob[]): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
