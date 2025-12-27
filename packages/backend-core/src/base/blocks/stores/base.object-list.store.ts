import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseObjectListStoreClient<T> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  lpush(id: string, ...values: T[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    const serialized = values.map((v) => JSON.stringify(v));
    return this.exec('lpush', key, this.redis.lpush(key, ...serialized));
  }
  rpush(id: string, ...values: T[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    const serialized = values.map((v) => JSON.stringify(v));
    return this.exec('rpush', key, this.redis.rpush(key, ...serialized));
  }

  lpop(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('lpop', key, this.redis.lpop(key)).map((res) =>
      res ? (JSON.parse(res) as T) : null,
    );
  }

  rpop(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('rpop', key, this.redis.rpop(key)).map((res) =>
      res ? (JSON.parse(res) as T) : null,
    );
  }

  llen(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('llen', key, this.redis.llen(key));
  }

  lrange(id: string, start: number, stop: number): ResultAsync<T[], never> {
    const key = this.getKey(id);
    return this.exec('lrange', key, this.redis.lrange(key, start, stop)).map((res) =>
      res.map((item) => JSON.parse(item) as T),
    );
  }
}

export abstract class BaseObjectListStore<T> extends BaseRedisStore {
  protected client: BaseObjectListStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseObjectListStoreClient<T>(redis, prefix, options);
  }
}
