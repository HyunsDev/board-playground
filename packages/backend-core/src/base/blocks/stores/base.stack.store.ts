import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseObjectListStore } from './base.object-list.store';
import { StoreOptions } from './base.redis.store';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

export abstract class BaseStackStore<T> extends BaseObjectListStore<T> {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly stackId: string,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  push(...values: T[]): ResultAsync<void, UnexpectedRedisErrorException> {
    return this.client.lpush(this.stackId, ...values).map(() => undefined);
  }

  pop(): ResultAsync<T | null, UnexpectedRedisErrorException> {
    return this.client.lpop(this.stackId);
  }

  size(): ResultAsync<number, UnexpectedRedisErrorException> {
    return this.client.llen(this.stackId);
  }
}
