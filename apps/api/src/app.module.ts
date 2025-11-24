import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule, ClsService } from 'nestjs-cls';

import { GlobalExceptionsFilter } from './libs/application/filters/global-exception.filer';
import { ClsAccessor } from './libs/cls';
import { RequestContextService } from './modules/cls/request-context.service';
import { RequestIdMiddleware } from './modules/cls/request-id.middleware';
import { HelloModule } from './modules/hello/hello.module';
import { PrismaModule } from './modules/prisma/prisma.module';

const filters = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionsFilter,
  },
];

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    CqrsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    HelloModule,
  ],
  controllers: [],
  providers: [...filters, RequestContextService],
})
export class AppModule {
  constructor(private readonly cls: ClsService) {
    ClsAccessor.setClsService(this.cls);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
