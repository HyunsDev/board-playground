import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { getCommonPinoConfig } from './config/pino-common.config';
import { createDevLoggerStream } from './config/pino-pretty.config';
import { EventPublishInstrumentation } from './instrumentations/event-publish.instrumentation';

import { CoreConfig, coreConfig } from '@/modules/foundation/config';
import { CoreContext, TokenContext } from '@/modules/foundation/context';
import { CoreContextModule } from '@/modules/foundation/context/context.module';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    CoreContextModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule, CoreContextModule],
      inject: [coreConfig.KEY, CoreContext, TokenContext],
      useFactory: async (
        coreConfig: CoreConfig,
        coreContext: CoreContext,
        tokenContext: TokenContext,
      ) => {
        const isProduction = coreConfig.nodeEnv === 'production';

        const commonConfig = getCommonPinoConfig(isProduction, coreContext, tokenContext);
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
  providers: [EventPublishInstrumentation],
  exports: [LoggerModule],
})
export class LoggingModule {}
