// packages/backend-core/src/modules/persistence/store/base/base-number.store.ts

import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

class BaseNumberStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  /** 초기 값 설정 (주의: atomic 아님, 초기화 용도만) */
  set(id: string, value: number, ttl?: number): ResultAsync<void, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    const command = ttl
      ? this.redis.set(key, value.toString(), 'EX', ttl)
      : this.redis.set(key, value.toString());

    return this.exec('set', key, command).map(() => undefined);
  }

  get(id: string): ResultAsync<number | null, UnexpectedRedisErrorException> {
    const key = this.getKey(id);

    return this.exec('get', key, this.redis.get(key)).map((res) => (res === null ? null : +res));
  }

  incr(id: string): ResultAsync<number, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('incr', key, this.redis.incr(key));
  }

  decr(id: string): ResultAsync<number, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('decr', key, this.redis.decr(key));
  }

  incrBy(id: string, amount: number): ResultAsync<number, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('incrBy', key, this.redis.incrby(key, amount));
  }

  decrBy(id: string, amount: number): ResultAsync<number, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('decrBy', key, this.redis.decrby(key, amount));
  }
}

export abstract class BaseNumberStore extends BaseRedisStore {
  protected client: BaseNumberStoreClient;

  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseNumberStoreClient(redis, prefix, options);
  }
}
