import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TerminusModule, PrismaHealthIndicator } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { HEALTH_OPTIONS, HealthModuleOptions } from './health.interface';
import { CacheModule } from '../cache';
import { DatabaseModule } from '../database';
import { CacheHealthIndicator } from './indicators/cache.indicator';

@Module({})
export class HealthModule {
  static forRoot(options: HealthModuleOptions = {}): DynamicModule {
    const controllers = options.exposeHttp ? [HealthController] : [];

    const imports: DynamicModule['imports'] = [TerminusModule];
    const providers: Provider[] = [
      {
        provide: HEALTH_OPTIONS,
        useValue: options,
      },
    ];

    // Prisma 체크
    if (options.check?.prisma) {
      imports.push(DatabaseModule);
      providers.push(PrismaHealthIndicator);
    }

    // Redis 체크
    if (options.check?.redis) {
      imports.push(CacheModule);
      providers.push(CacheHealthIndicator);
    }

    return {
      module: HealthModule,
      imports,
      controllers,
      providers,
    };
  }
}
