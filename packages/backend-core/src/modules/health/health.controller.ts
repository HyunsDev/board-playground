// libs/backend-core/src/health/health.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';

import { PrismaService } from '../database';
import { HEALTH_OPTIONS, HealthModuleOptions } from './health.interface';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prismaService: PrismaService,
    @Inject(HEALTH_OPTIONS)
    private options: HealthModuleOptions,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const indicators = [];

    // 옵션에 따라 DB 체크 추가
    if (this.options.checkDatabase) {
      indicators.push(() => this.prismaHealth.pingCheck('database', this.prismaService));
    }

    // 필요하다면 메모리 체크 등 기본 체크 추가 가능
    // indicators.push(() => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024));

    return this.health.check(indicators);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    const indicators = [];

    // 옵션에 따라 DB 체크 추가
    if (this.options.checkDatabase) {
      indicators.push(() => this.prismaHealth.pingCheck('database', this.prismaService));
    }

    return this.health.check(indicators);
  }
}
