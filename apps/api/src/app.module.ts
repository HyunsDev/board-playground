import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule, ClsService } from 'nestjs-cls';

import { ExceptionInterceptor } from './libs/application/interceptors/exception.interceptor';
import { ClsAccessor } from './libs/cls';
import { RequestContextService } from './modules/cls/request-context.service';
import { RequestIdMiddleware } from './modules/cls/request-id.middleware';
import { PrismaModule } from './modules/prisma/prisma.module';

const interceptors = [
  {
    provide: APP_INTERCEPTOR,
    useClass: ExceptionInterceptor,
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
  ],
  controllers: [],
  providers: [...interceptors, RequestContextService],
})
export class AppModule {
  constructor(private readonly cls: ClsService) {
    ClsAccessor.setClsService(this.cls);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
