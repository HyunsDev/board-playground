import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // [NEW] 표준 Config
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { getCommonPinoConfig } from './config/pino-common.config';
import { createDevLoggerStream } from './config/pino-pretty.config';
import { CqrsInstrumentation } from './cqrs.instrumentation';
import { ContextService } from '../context/context.service';

import { CoreContextModule } from '@/context/context.module';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    CoreContextModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule, CoreContextModule],
      inject: [ConfigService, ContextService],
      useFactory: async (configService: ConfigService, contextService: ContextService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';

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
