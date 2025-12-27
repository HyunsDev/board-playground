import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseStringListStoreClient<T extends string> extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  lpush(id: string, ...values: T[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('lpush', key, this.redis.lpush(key, ...values));
  }

  rpush(id: string, ...values: T[]): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('rpush', key, this.redis.rpush(key, ...values));
  }

  lpop(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('lpop', key, this.redis.lpop(key) as Promise<T | null>);
  }

  rpop(id: string): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('rpop', key, this.redis.rpop(key) as Promise<T | null>);
  }

  llen(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('llen', key, this.redis.llen(key));
  }

  lset(id: string, index: number, value: T): ResultAsync<'OK', never> {
    const key = this.getKey(id);
    return this.exec('lset', key, this.redis.lset(key, index, value));
  }

  lrem(id: string, count: number, value: T): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('lrem', key, this.redis.lrem(key, count, value));
  }

  lindex(id: string, index: number): ResultAsync<T | null, never> {
    const key = this.getKey(id);
    return this.exec('lindex', key, this.redis.lindex(key, index) as Promise<T | null>);
  }

  lrange(id: string, start: number, stop: number): ResultAsync<T[], never> {
    const key = this.getKey(id);
    return this.exec('lrange', key, this.redis.lrange(key, start, stop) as Promise<T[]>);
  }

  ltrim(id: string, start: number, stop: number): ResultAsync<'OK', never> {
    const key = this.getKey(id);
    return this.exec('ltrim', key, this.redis.ltrim(key, start, stop));
  }
}

export abstract class BaseStringListStore<T extends string = string> extends BaseRedisStore {
  protected client: BaseStringListStoreClient<T>;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseStringListStoreClient<T>(redis, prefix, options);
  }
}
