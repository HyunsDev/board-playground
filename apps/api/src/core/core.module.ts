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
} from '@workspace/backend-core';

import { refreshTokenConfig } from './configs/refresh-token.config';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    CoreConfigModule.forRoot({
      isHttp: true,
      extraLoad: [refreshTokenConfig],
    }),
    CqrsModule.forRoot(),
    DatabaseModule,
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
