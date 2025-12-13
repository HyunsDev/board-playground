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
} from '@workspace/backend-core';

import { refreshTokenConfig } from './configs/refresh-token.config';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    CoreConfigModule.forRoot({
      extraLoad: [httpConfig, prismaConfig, accessTokenConfig, redisConfig, refreshTokenConfig],
    }),
    CqrsModule.forRoot(),
    DatabaseModule,
    CacheModule,
    HttpContextModule.forRoot(),
    EventBusModule,
    LoggingModule,
    SecurityModule.forRoot({
      enableGlobalAuthGuard: true,
    }),
    ExceptionFilterModule,
    HealthModule.forRoot({
      exposeHttp: true,
      checkDatabase: true,
    }),
  ],
  exports: [HttpContextModule, DatabaseModule, EventBusModule, LoggingModule, SecurityModule],
})
export class CoreModule {}
