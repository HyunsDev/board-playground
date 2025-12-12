import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ContextMiddleware } from './context.middleware';
import { CoreContextModule } from '../context.module';
import { ErrorLoggingInterceptor } from './error-logging.interceptor';

@Module({
  imports: [CoreContextModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
  ],
  exports: [CoreContextModule],
})
export class HttpContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL }); // Cls run 및 Context 초기화
  }
}
