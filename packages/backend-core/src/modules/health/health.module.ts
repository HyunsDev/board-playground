// libs/backend-core/src/health/health.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { HEALTH_OPTIONS, HealthModuleOptions } from './health.interface';
import { DatabaseModule } from '../database';

@Module({})
export class HealthModule {
  static forRoot(options: HealthModuleOptions = {}): DynamicModule {
    const controllers = options.exposeHttp ? [HealthController] : [];
    const imports = [TerminusModule, DatabaseModule];

    return {
      module: HealthModule,
      imports: imports,
      controllers: controllers,
      providers: [
        {
          provide: HEALTH_OPTIONS,
          useValue: options,
        },
      ],
      exports: [],
    };
  }
}
