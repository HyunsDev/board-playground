import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseSetStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  sadd(id: string, ...members: string[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('sadd', key, this.redis.sadd(key, ...members));
  }

  srem(id: string, ...members: string[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('srem', key, this.redis.srem(key, ...members));
  }

  sismember(id: string, member: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('sismember', key, this.redis.sismember(key, member));
  }

  smembers(id: string): ResultAsync<string[], never> {
    const key = this.getKey(id);
    return this.exec('smembers', key, this.redis.smembers(key));
  }

  scard(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('scard', key, this.redis.scard(key));
  }
}

export abstract class BaseSetStore extends BaseRedisStore {
  protected client: BaseSetStoreClient;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseSetStoreClient(redis, prefix, options);
  }
}
