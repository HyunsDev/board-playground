import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { CqrsLoggingService } from './cqrs-logging.service';
import { getCommonPinoConfig } from './pino-common.config';
import { createDevLoggerStream } from './pino-pretty.config';
import { ContextModule } from '../context/context.module';
import { ContextService } from '../context/context.service';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule, ContextModule],
      inject: [ConfigService, ContextService],
      useFactory: async (configService: ConfigService, contextService: ContextService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
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
