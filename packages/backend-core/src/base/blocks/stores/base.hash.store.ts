import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseHashStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  baseHSet(id: string, field: string, value: string | number): ResultAsync<void, never> {
    const key = this.getKey(id);
    return this.exec('baseHSet', key, this.redis.hset(key, field, value)).map(() => undefined);
  }

  baseHGet(id: string, field: string): ResultAsync<string | null, never> {
    const key = this.getKey(id);
    return this.exec('baseHGet', key, this.redis.hget(key, field));
  }

  baseHGetAll(id: string): ResultAsync<Record<string, string>, never> {
    const key = this.getKey(id);
    return this.exec('baseHGetAll', key, this.redis.hgetall(key));
  }
}

export abstract class BaseHashStore extends BaseRedisStore {
  protected client: BaseHashStoreClient;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseHashStoreClient(redis, prefix, options);
  }
}
