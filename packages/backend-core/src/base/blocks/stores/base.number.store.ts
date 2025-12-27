// packages/backend-core/src/modules/persistence/store/base/base-number.store.ts

import Redis from 'ioredis';

import { DomainResultAsync } from '@workspace/backend-ddd';
import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

class BaseNumberStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  /** 초기 값 설정 (주의: atomic 아님, 초기화 용도만) */
  set(id: string, value: number, ttl?: number): DomainResultAsync<void, never> {
    const key = this.getKey(id);
    const ttlToUse = this.resolveTtl(ttl);
    const command = ttlToUse
      ? this.redis.set(key, value.toString(), 'EX', ttlToUse)
      : this.redis.set(key, value.toString());

    return this.exec('set', key, command).map(() => undefined);
  }

  get(id: string): DomainResultAsync<number | null, never> {
    const key = this.getKey(id);

    return this.exec('get', key, this.redis.get(key)).map((res) => (res === null ? null : +res));
  }

  incr(id: string): DomainResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('incr', key, this.redis.incr(key));
  }

  decr(id: string): DomainResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('decr', key, this.redis.decr(key));
  }

  incrBy(id: string, amount: number): DomainResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('incrBy', key, this.redis.incrby(key, amount));
  }

  decrBy(id: string, amount: number): DomainResultAsync<number, never> {
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
