import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseRedisStore, BaseRedisStoreClient, StoreOptions } from './base.redis.store';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

class BaseStringStoreClient extends BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  set(id: string, value: string, ttl?: number): ResultAsync<void, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    const command = ttl ? this.redis.set(key, value, 'EX', ttl) : this.redis.set(key, value);

    return this.exec('set', key, command).map(() => undefined);
  }

  get(id: string): ResultAsync<string | null, UnexpectedRedisErrorException> {
    const key = this.getKey(id);
    return this.exec('get', key, this.redis.get(key)).map((res) => (res ? res : null));
  }
}

export abstract class BaseStringStore extends BaseRedisStore {
  protected client: BaseStringStoreClient;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
    this.client = new BaseStringStoreClient(redis, prefix, options);
  }
}
