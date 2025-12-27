import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseStringStoreClient<T extends string> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  set(id: string, value: T, ttl?: number): ResultAsync<void, never> {
    const key = this.getKey(id);
    const command = ttl ? this.redis.set(key, value, 'EX', ttl) : this.redis.set(key, value);

    return this.exec('set', key, command).map(() => undefined);
  }

  get(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('get', key, this.redis.get(key)).map((res) => (res ? (res as T) : null));
  }

  getDel(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('getdel', key, this.redis.getdel(key)).map((res) => (res ? (res as T) : null));
  }

  compare(id: string, value: T): ResultAsync<boolean, never> {
    return this.get(id).map((storedValue) => storedValue === value);
  }

  /**
   * 조회된 값과 입력값이 동일한지 비교하고, 동일하면 삭제합니다. 원자적으로 처리됩니다.
   * @param id
   * @param value
   * @returns
   */
  verifyAndConsume(id: string, value: T): ResultAsync<boolean, never> {
    return this.eval<number>(VERIFY_AND_CONSUME_LUA, [this.getKey(id)], [value]).map(
      (res) => res === 1,
    );
  }
}

const VERIFY_AND_CONSUME_LUA = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  redis.call("DEL", KEYS[1])
  return 1
end
return 0
`;

export abstract class BaseStringStore<T extends string = string> extends BaseRedisStore {
  protected client: BaseStringStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseStringStoreClient<T>(redis, prefix, options);
  }
}
