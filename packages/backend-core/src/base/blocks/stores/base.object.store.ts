import Redis from 'ioredis';
import { ResultAsync, okAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseObjectStoreClient<T> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  set(id: string, value: T, ttl?: number): ResultAsync<void, never> {
    const key = this.getKey(id);
    return this.serializeJson(value)
      .andThen((serialized) => {
        const ttlToUse = this.resolveTtl(ttl);
        const command = ttlToUse
          ? this.redis.set(key, serialized, 'EX', ttlToUse)
          : this.redis.set(key, serialized);

        return this.exec('set', key, command);
      })
      .map(() => undefined);
  }

  get(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('get', key, this.redis.get(key)).andThen((res) => {
      if (res === null) {
        return okAsync(null);
      }
      return this.parseJson<T>(res);
    });
  }

  getDel(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('getdel', key, this.redis.getdel(key)).andThen((res) => {
      if (res === null) {
        return okAsync(null);
      }
      return this.parseJson<T>(res);
    });
  }
}

export abstract class BaseObjectStore<T> extends BaseRedisStore {
  protected client: BaseObjectStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseObjectStoreClient<T>(redis, prefix, options);
  }
}
