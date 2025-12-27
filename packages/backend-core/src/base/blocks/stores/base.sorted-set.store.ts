import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseSortedSetStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  zadd(id: string, score: number, member: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zadd', key, this.redis.zadd(key, score, member));
  }

  zrem(id: string, ...members: string[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zrem', key, this.redis.zrem(key, ...members));
  }

  zscore(id: string, member: string): ResultAsync<string | null, never> {
    const key = this.getKey(id);
    return this.exec('zscore', key, this.redis.zscore(key, member));
  }

  zcard(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zcard', key, this.redis.zcard(key));
  }

  zrank(id: string, member: string): ResultAsync<number | null, never> {
    const key = this.getKey(id);
    return this.exec('zrank', key, this.redis.zrank(key, member));
  }

  zrevrank(id: string, member: string): ResultAsync<number | null, never> {
    const key = this.getKey(id);
    return this.exec('zrevrank', key, this.redis.zrevrank(key, member));
  }

  zrange(id: string, start: number, stop: number): ResultAsync<string[], never> {
    const key = this.getKey(id);
    return this.exec('zrange', key, this.redis.zrange(key, start, stop));
  }

  zrevrange(id: string, start: number, stop: number): ResultAsync<string[], never> {
    const key = this.getKey(id);
    return this.exec('zrevrange', key, this.redis.zrevrange(key, start, stop));
  }

  zcount(id: string, min: number, max: number): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('zcount', key, this.redis.zcount(key, min, max));
  }

  zincrby(id: string, increment: number, member: string): ResultAsync<string, never> {
    const key = this.getKey(id);
    return this.exec('zincrby', key, this.redis.zincrby(key, increment, member));
  }
}

export abstract class BaseSortedSetStore extends BaseRedisStore {
  protected client: BaseSortedSetStoreClient;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseSortedSetStoreClient(redis, prefix, options);
  }
}
