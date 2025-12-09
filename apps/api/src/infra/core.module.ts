import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppConfigModule } from './config/app-config.module';
import { ContextModule } from './context/context.module';
import { PrismaModule } from './database/prisma.module';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';
import { CoreLoggerModule } from './logger/core-logger.module';

@Global()
@Module({
  imports: [
    AppConfigModule,
    ExceptionFilterModule,
    ContextModule,
    PrismaModule,
    CoreLoggerModule,
    CqrsModule,
  ],
  exports: [ContextModule, PrismaModule, CoreLoggerModule, CqrsModule],
})
export class CoreModule {}
