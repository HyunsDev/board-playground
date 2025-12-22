import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule as NestConfigModule } from '@nestjs/config';

import { coreConfig } from './configs/core.config';

export interface CoreConfigOptions {
  extraLoad?: ConfigFactory[];
}

@Module({})
export class ConfigModule {
  static forRoot(options: CoreConfigOptions = {}): DynamicModule {
    const { extraLoad = [] } = options;

    const finalLoad = [coreConfig, ...extraLoad];

    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          load: finalLoad,
          envFilePath: ['.env.local', '.env'],
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
