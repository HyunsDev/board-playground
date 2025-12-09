import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { CqrsInstrumentation } from './cqrs.Instrumentation';
import { getCommonPinoConfig } from './pino-common.config';
import { createDevLoggerStream } from './pino-pretty.config';
import { ExecutionConfig, executionConfig } from '../config/configs/execution.config';
import { ContextService } from '../context/context.service';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    LoggerModule.forRootAsync({
      inject: [executionConfig.KEY, ContextService],
      useFactory: async (executionConfig: ExecutionConfig, contextService: ContextService) => {
        const isProduction = executionConfig.nodeEnv === 'production';
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
})
export class LoggingModule {}
