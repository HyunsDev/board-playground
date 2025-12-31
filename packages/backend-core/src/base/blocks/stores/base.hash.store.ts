import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseHashStoreClient<T extends string> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  hSet(id: string, field: string, value: T): ResultAsync<void, never> {
    const key = this.getKey(id);
    return this.exec('hSet', key, this.redis.hset(key, field, value)).map(() => undefined);
  }

  hGet(id: string, field: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('hGet', key, this.redis.hget(key, field) as Promise<T | null>);
  }

  hGetAll(id: string): ResultAsync<Record<string, T>, never> {
    const key = this.getKey(id);
    return this.exec('hGetAll', key, this.redis.hgetall(key) as Promise<Record<string, T>>);
  }
}

export abstract class BaseHashStore<T extends string = string> extends BaseRedisStore {
  protected client: BaseHashStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseHashStoreClient(redis, prefix, options);
  }
}
