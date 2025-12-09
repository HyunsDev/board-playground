import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppConfigModule } from './config/app-config.module';
import { ContextModule } from './context/context.module';
import { DomainEventModule } from './domain-event/domain-event.module';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';
import { CoreLoggerModule } from './logger/core-logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  imports: [
    AppConfigModule,
    ExceptionFilterModule,
    ContextModule,
    DomainEventModule,
    PrismaModule,
    CoreLoggerModule,
    CqrsModule,
  ],
  exports: [ContextModule, PrismaModule, CoreLoggerModule, CqrsModule, DomainEventModule],
})
export class CoreModule {}
