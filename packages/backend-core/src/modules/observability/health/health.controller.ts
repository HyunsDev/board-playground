import { Controller, Get, Inject, Optional } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { HEALTH_OPTIONS, HealthModuleOptions } from './health.interface';
import { CacheHealthIndicator } from './indicators/cache.indicator';

import { PrismaService } from '@/modules/persistence/database';
import { Public } from '@/modules/security';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,

    @Inject(HEALTH_OPTIONS)
    private readonly options: HealthModuleOptions,

    @Optional()
    private readonly cacheHealth?: CacheHealthIndicator,

    @Optional()
    private readonly prismaHealth?: PrismaHealthIndicator,

    @Optional()
    private readonly prismaService?: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  readiness() {
    const indicators: HealthIndicatorFunction[] = [];

    const { prismaHealth, prismaService, cacheHealth } = this;

    if (this.options.check?.prisma && prismaHealth && prismaService) {
      indicators.push(() => prismaHealth.pingCheck('database', prismaService));
    }

    if (this.options.check?.redis && cacheHealth) {
      indicators.push(() => cacheHealth.isHealthy('cache'));
    }

    return this.health.check(indicators);
  }

  @Public()
  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }
}
