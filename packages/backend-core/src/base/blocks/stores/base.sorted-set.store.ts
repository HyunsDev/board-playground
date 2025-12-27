import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseSortedSetStoreClient<T extends string> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  zadd(id: string, score: number, member: T): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zadd', key, this.redis.zadd(key, score, member));
  }

  zrem(id: string, ...members: T[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zrem', key, this.redis.zrem(key, ...members));
  }

  zscore(id: string, member: T): ResultAsync<string | null, never> {
    const key = this.getKey(id);
    return this.exec('zscore', key, this.redis.zscore(key, member));
  }

  zcard(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zcard', key, this.redis.zcard(key));
  }

  zrank(id: string, member: T): ResultAsync<number | null, never> {
    const key = this.getKey(id);
    return this.exec('zrank', key, this.redis.zrank(key, member));
  }

  zrevrank(id: string, member: T): ResultAsync<number | null, never> {
    const key = this.getKey(id);
    return this.exec('zrevrank', key, this.redis.zrevrank(key, member));
  }

  zrange(id: string, start: number, stop: number): ResultAsync<T[], never> {
    const key = this.getKey(id);
    return this.exec('zrange', key, this.redis.zrange(key, start, stop) as Promise<T[]>);
  }

  zrevrange(id: string, start: number, stop: number): ResultAsync<T[], never> {
    const key = this.getKey(id);
    return this.exec('zrevrange', key, this.redis.zrevrange(key, start, stop) as Promise<T[]>);
  }

  zcount(id: string, min: number, max: number): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zcount', key, this.redis.zcount(key, min, max));
  }
}

export abstract class BaseSortedSetStore<T extends string = string> extends BaseRedisStore {
  protected client: BaseSortedSetStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseSortedSetStoreClient<T>(redis, prefix, options);
  }
}
