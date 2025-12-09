import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { CqrsLoggingService } from './cqrs-logging.service';
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
        if (!isProduction) {
          const devStream = await createDevLoggerStream();

          return {
            pinoHttp: {
              ...commonConfig,
              stream: devStream,
            },
          };
        }
        return {
          pinoHttp: commonConfig,
        };
      },
    }),
  ],
  providers: [CqrsLoggingService],
})
export class CoreLoggerModule {}
