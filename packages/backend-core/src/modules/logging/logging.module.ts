import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { getCommonPinoConfig } from './config/pino-common.config';
import { createDevLoggerStream } from './config/pino-pretty.config';
import { CqrsInstrumentation } from './instrumentations/cqrs.instrumentation';
import { ContextService } from '../context/context.service';

import { CoreConfig, coreConfig } from '@/modules/config';
import { CoreContextModule } from '@/modules/context/context.module';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    CoreContextModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule, CoreContextModule],
      inject: [coreConfig.KEY, ContextService],
      useFactory: async (coreConfig: CoreConfig, contextService: ContextService) => {
        const isProduction = coreConfig.nodeEnv === 'production';

        const commonConfig = getCommonPinoConfig(isProduction, contextService);

        if (isProduction) {
          return { pinoHttp: commonConfig };
        }

        const devStream = await createDevLoggerStream();
        return {
          pinoHttp: {
            ...commonConfig,
            stream: devStream,
          },
        };
      },
    }),
  ],
  providers: [CqrsInstrumentation],
  exports: [LoggerModule],
})
export class LoggingModule {}
