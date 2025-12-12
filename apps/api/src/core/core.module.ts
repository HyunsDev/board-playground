import { Global, Module } from '@nestjs/common';

import {
  CoreConfigModule,
  DatabaseModule,
  EventBusModule,
  HttpContextModule,
  LoggingModule,
  SecurityModule,
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
    HttpContextModule,
    DatabaseModule,
    EventBusModule,
    LoggingModule,
    SecurityModule.forRoot({
      enableGlobalAuthGuard: true,
    }),
    ExceptionFilterModule,
  ],
  exports: [HttpContextModule, DatabaseModule, EventBusModule, LoggingModule, SecurityModule],
})
export class CoreModule {}
