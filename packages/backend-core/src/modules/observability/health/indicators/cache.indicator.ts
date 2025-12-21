import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { CacheService } from '@/modules/persistence/cache';

@Injectable()
export class CacheHealthIndicator {
  constructor(
    private readonly cache: CacheService,
    private readonly health: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.health.check(key);
    const testKey = '__healthcheck__';
    const testValue = Date.now();

    try {
      await this.cache.setOrThrow(testKey, testValue, 1_000); // 1초 TTL
      const value = await this.cache.get<number>(testKey);

      const isHealthy = value === testValue;

      if (!isHealthy) return indicator.down();
      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
