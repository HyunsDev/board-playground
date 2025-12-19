import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { err, ok, Result } from 'neverthrow';

import { DomainCodeEnums } from '@workspace/domain';

import { CacheInfrastructureErrorException } from './errors';
import { systemLog, SystemLogActionEnum } from '../logging';
import { CacheInfrastructureError } from './errors/cache.errors';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  /**
   * 캐시 조회 (실패 시 null 반환, 로그만 남김)
   * 일반적인 조회 성능 향상용
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cache.get<T>(key);
      return value ?? null;
    } catch (e) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache get failed. key=${key}, error=${e}`,
        }),
      );
      return null;
    }
  }

  /**
   * 캐시 조회 (성공/실패를 명시적으로 처리해야 함)
   * 중요한 비즈니스 로직(예: 중복 결제 방지 키 확인) 등에서 사용
   */
  async tryGet<T>(key: string): Promise<Result<T | null, CacheInfrastructureError>> {
    try {
      const value = await this.cache.get<T>(key);
      return ok(value ?? null);
    } catch (e: unknown) {
      // 여기서는 로그를 error 레벨로 찍거나, 호출부로 책임을 넘깁니다.
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache tryGet failed. key=${key}, error=${e}`,
        }),
      );
      return err(new CacheInfrastructureError(key, e));
    }
  }

  async getOrThrow<T>(key: string): Promise<T | null> {
    try {
      return (await this.cache.get<T>(key)) ?? null;
    } catch (e) {
      throw new CacheInfrastructureErrorException(`Failed to get cache key: ${key}`, {
        key,
        originalError: e,
      });
    }
  }

  /**
   * 캐시 저장 (실패 시 무시, 로그만 남김)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl);
    } catch (e) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache set failed. key=${key}, error=${e}`,
        }),
      );
    }
  }

  /**
   * 캐시 저장 (성공/실패 명시)
   */
  async trySet(
    key: string,
    value: unknown,
    ttl?: number,
  ): Promise<Result<void, CacheInfrastructureError>> {
    try {
      await this.cache.set(key, value, ttl);
      return ok(undefined);
    } catch (e: unknown) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache trySet failed. key=${key}, error=${e}`,
        }),
      );
      return err(new CacheInfrastructureError(key, e));
    }
  }

  async setOrThrow(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl);
    } catch (e) {
      throw new CacheInfrastructureErrorException(`Failed to set cache key: ${key}`, {
        key,
        originalError: e,
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (e) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache del failed. key=${key}, error=${e}`,
        }),
      );
    }
  }

  async tryDel(key: string): Promise<Result<void, CacheInfrastructureError>> {
    try {
      await this.cache.del(key);
      return ok(undefined);
    } catch (e: unknown) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.RedisError, {
          msg: `Cache tryDel failed. key=${key}, error=${e}`,
        }),
      );
      return err(new CacheInfrastructureError(key, e));
    }
  }

  async delOrThrow(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (e) {
      throw new CacheInfrastructureErrorException(`Failed to delete cache key: ${key}`, {
        key,
        originalError: e,
      });
    }
  }
}
