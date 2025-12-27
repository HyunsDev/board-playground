import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

class BaseObjectStoreClient<T> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  set(id: string, value: T, ttl?: number): ResultAsync<void, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    const serialized = JSON.stringify(value);
    const command = ttl
      ? this.redis.set(key, serialized, 'EX', ttl)
      : this.redis.set(key, serialized);

    return this.exec('set', key, command).map(() => undefined);
  }

  get(id: string): ResultAsync<T | null, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('get', key, this.redis.get(key)).map((res) =>
      res ? (JSON.parse(res) as T) : null,
    );
  }

  getDel(id: string): ResultAsync<T | null, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('getdel', key, this.redis.getdel(key)).map((res) =>
      res ? (JSON.parse(res) as T) : null,
    );
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
