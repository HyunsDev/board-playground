import { DynamicModule, Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';

import { redisConfig } from './configs';
import { accessTokenConfig } from './configs/access-token.config';
import { coreConfig } from './configs/core.config';
import { httpConfig } from './configs/http.config';
import { prismaConfig } from './configs/prisma.config';

export interface CoreConfigOptions {
  load?: ConfigFactory[];
  extraLoad?: ConfigFactory[];
}

@Module({})
export class CoreConfigModule {
  static forRoot(options: CoreConfigOptions = {}): DynamicModule {
    const {
      load = [coreConfig, httpConfig, prismaConfig, accessTokenConfig, redisConfig],
      extraLoad = [],
    } = options;

    const finalLoad = [...load, ...extraLoad];

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
