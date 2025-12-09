import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AppConfigModule } from './config/app-config.module';
import { ContextModule } from './context/context.module';
import { DomainEventModule } from './domain-event/domain-event.module';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';
import { LoggingModule } from './logging/logging.module';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  imports: [
    AppConfigModule,
    ExceptionFilterModule,
    ContextModule,
    DomainEventModule,
    PrismaModule,
    LoggingModule,
    CqrsModule,
  ],
  exports: [ContextModule, PrismaModule, LoggingModule, CqrsModule, DomainEventModule],
})
export class CoreModule {}
