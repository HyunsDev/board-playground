import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StoreCode } from '@workspace/domain';

import { BaseObjectListStore } from './base.object-list.store';
import { StoreOptions } from './base.redis.store';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

export abstract class BaseQueueStore<T> extends BaseObjectListStore<T> {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly queueId: string,
    protected readonly options: StoreOptions = {},
  ) {
    super(redis, prefix, options);
  }

  enqueue(...values: T[]): ResultAsync<void, UnexpectedRedisErrorException> {
    return this.client.rpush(this.queueId, ...values).map(() => undefined);
  }

  dequeue(): ResultAsync<T | null, UnexpectedRedisErrorException> {
    return this.client.lpop(this.queueId);
  }

  size(): ResultAsync<number, UnexpectedRedisErrorException> {
    return this.client.llen(this.queueId);
  }
}
