import { AbstractIJob, AbstractJob } from './abstract.job';

export abstract class JobDispatcherPort {
  abstract dispatch(
    job: AbstractJob<string, string, string, string, AbstractIJob<string, unknown>>,
  ): Promise<void>;

  /**
   * 여러 작업을 한 번에 큐에 등록합니다.
   */
  abstract dispatchMany(
    jobs: AbstractJob<string, string, string, string, AbstractIJob<string, unknown>>[],
  ): Promise<void>;

  /**
   * 버퍼에 담긴 작업들을 모두 비웁니다. (발송 취소)
   * 주로 트랜잭션 롤백 시 호출됩니다.
   */
  abstract clear(): void;

  /**
   * 버퍼에 담긴 작업들을 실제로 큐에 전송합니다.
   * 주로 트랜잭션 커밋 직후 호출됩니다.
   */
  abstract flush(): Promise<void>;
}
