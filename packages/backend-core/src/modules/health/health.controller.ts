// libs/backend-core/src/health/health.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

import { PrismaService } from '../database';
import { HEALTH_OPTIONS, HealthModuleOptions } from './health.interface';
import { Public } from '../security';
import { CacheHealthIndicator } from './indicators/cache.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private cacheHealth: CacheHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prismaService: PrismaService,
    @Inject(HEALTH_OPTIONS)
    private options: HealthModuleOptions,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  readiness() {
    const indicators = [];

    if (this.options?.check?.prisma) {
      indicators.push(() => this.prismaHealth.pingCheck('database', this.prismaService));
    }

    if (this.options?.check?.redis) {
      indicators.push(() => this.cacheHealth.isHealthy('cache'));
    }

    return this.health.check(indicators);
  }

  @Public()
  @Get('live')
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
