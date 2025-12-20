import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  CoreConfigModule,
  DatabaseModule,
  DomainEventModule,
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
  StorageModule,
  StorageWorkerModule,
  MessagingModule,
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
    TaskQueueModule.forRoot(),
    HttpContextModule.forRoot(),
    DatabaseModule,
    CacheModule,
    StorageModule,
    StorageWorkerModule,
    DomainEventModule,
    LoggingModule,
    MessagingModule,
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
    DomainEventModule,
    LoggingModule,
    SecurityModule,
    CqrsModule,
  ],
})
export class CoreModule {}
