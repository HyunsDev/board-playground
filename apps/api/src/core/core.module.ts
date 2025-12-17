import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  CoreConfigModule,
  DatabaseModule,
  EventBusModule,
  HttpContextModule,
  LoggingModule,
  SecurityModule,
  HealthModule,
  CacheModule,
  accessTokenConfig,
  httpConfig,
  prismaConfig,
  redisConfig,
  TaskQueueModule,
  ssmConfig,
} from '@workspace/backend-core';

import { refreshTokenConfig } from './configs/refresh-token.config';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    CoreConfigModule.forRoot({
      extraLoad: [
        httpConfig,
        prismaConfig,
        accessTokenConfig,
        redisConfig,
        refreshTokenConfig,
        ssmConfig,
      ],
    }),
    CqrsModule.forRoot(),
    TaskQueueModule,
    HttpContextModule.forRoot(),
    DatabaseModule,
    CacheModule,
    EventBusModule,
    LoggingModule,
    SecurityModule.forRoot({
      enableGlobalAuthGuard: true,
    }),
    ExceptionFilterModule,
    HealthModule.forRoot({
      exposeHttp: true,
      check: {
        prisma: true,
        redis: true,
      },
    }),
  ],
  exports: [
    HttpContextModule,
    DatabaseModule,
    EventBusModule,
    LoggingModule,
    SecurityModule,
    CqrsModule,
  ],
})
export class CoreModule {}
