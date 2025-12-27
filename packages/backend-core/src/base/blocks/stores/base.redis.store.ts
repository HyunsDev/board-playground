import Redis from 'ioredis';
import { ResultAsync } from 'neverthrow';

import { StorePort } from '@workspace/backend-ddd';
import { StoreCode } from '@workspace/domain';

import { UnexpectedRedisErrorException } from '@/base/core.exceptions';

export interface StoreOptions {
  defaultTtl?: number;
}

export class BaseRedisStoreClient {
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {}

  exists(id: string): ResultAsync<boolean, never> {
    const key = this.getKey(id);
    return this.exec('exists', key, this.redis.exists(key)).map((res) => res === 1);
  }

  del(id: string): ResultAsync<void, never> {
    const key = this.getKey(id);
    return this.exec('del', key, this.redis.del(key)).map(() => undefined);
  }

  expire(id: string, ttlSeconds: number): ResultAsync<void, never> {
    const key = this.getKey(id);
    return this.exec('expire', key, this.redis.expire(key, ttlSeconds)).map(() => undefined);
  }

  ttl(id: string): ResultAsync<number, never> {
    const key = this.getKey(id);
    return this.exec('ttl', key, this.redis.ttl(key));
  }

  exec<T>(operation: string, key: string, promise: Promise<T>): ResultAsync<T, never> {
    return ResultAsync.fromPromise(promise, (error) => {
      throw this.unexpected(operation, key, error);
    });
  }

  getKey(key: string) {
    return `${this.prefix}:${key}`;
  }

  eval<T>(script: string, keys: string[], args: (string | number)[]): ResultAsync<T, never> {
    return this.exec(
      'eval',
      keys.join(','),
      this.redis.eval(script, keys.length, ...keys, ...args),
    ) as ResultAsync<T, never>;
  }

  protected resolveTtl(ttl?: number) {
    return ttl ?? this.options.defaultTtl;
  }

  protected serializeJson(value: unknown): ResultAsync<string, never> {
    return ResultAsync.fromSafePromise(Promise.resolve().then(() => JSON.stringify(value)));
  }

  protected serializeJsonList(values: unknown[]): ResultAsync<string[], never> {
    return ResultAsync.fromSafePromise(
      Promise.resolve().then(() => values.map((v) => JSON.stringify(v))),
    );
  }

  protected parseJson<T>(value: string): ResultAsync<T, never> {
    return ResultAsync.fromSafePromise(Promise.resolve().then(() => JSON.parse(value) as T));
  }

  protected parseJsonArray<T>(values: string[]): ResultAsync<T[], never> {
    return ResultAsync.fromSafePromise(
      Promise.resolve().then(() => values.map((value) => JSON.parse(value) as T)),
    );
  }

  protected unexpected(operation: string, key: string, error: unknown) {
    return new UnexpectedRedisErrorException(this.constructor.name, operation, key, error);
  }
}

export abstract class BaseRedisStore implements StorePort {
  protected client: BaseRedisStoreClient;
  constructor(
    protected readonly redis: Redis,
    protected readonly prefix: StoreCode,
    protected readonly options: StoreOptions = {},
  ) {
    this.client = new BaseRedisStoreClient(redis, prefix, options);
  }

  protected getKey(key: string) {
    return `${this.prefix}:${key}`;
  }

  exists(id: string): ResultAsync<boolean, never> {
    return this.client.exists(id);
  }
}
