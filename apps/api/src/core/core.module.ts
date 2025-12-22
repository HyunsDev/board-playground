import { Global, Module } from '@nestjs/common';

import {
  CoreConfigModule,
  DatabaseModule,
  DomainEventModule,
  HttpContextModule,
  LoggingModule,
  AccessControlModule,
  HealthModule,
  CacheModule,
  accessTokenConfig,
  httpConfig,
  prismaConfig,
  redisConfig,
  TaskQueueModule,
  ssmConfig,
  StorageModule,
  StorageWorkerModule,
  MessagingModule,
  CoreCqrsModule,
  SseModule,
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
    TaskQueueModule.forRoot(),
    HttpContextModule.forRoot(),
    DatabaseModule,
    CacheModule,
    StorageModule,
    StorageWorkerModule,
    DomainEventModule,
    LoggingModule,
    MessagingModule,
    CoreCqrsModule,
    AccessControlModule.forRoot({
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
    SseModule.forServer(),
  ],
  exports: [
    HttpContextModule,
    DatabaseModule,
    DomainEventModule,
    LoggingModule,
    AccessControlModule,
    CoreCqrsModule,
  ],
})
export class CoreModule {}
