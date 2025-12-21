import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';

import { coreConfig } from './configs/core.config';

export interface CoreConfigOptions {
  extraLoad?: ConfigFactory[];
}

@Module({})
export class CoreConfigModule {
  static forRoot(options: CoreConfigOptions = {}): DynamicModule {
    const { extraLoad = [] } = options;

    const finalLoad = [coreConfig, ...extraLoad];

    return {
      module: CoreConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: finalLoad,
          envFilePath: ['.env.local', '.env'],
        }),
      ],
      exports: [ConfigModule],
    };
  }
}
