import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ContextMiddleware } from './context.middleware';
import { CoreContextModule, CoreContextModuleOptions } from '../context.module';
import { ErrorLoggingInterceptor } from './error-logging.interceptor';

export type HttpContextModuleOptions = CoreContextModuleOptions;

@Module({})
export class HttpContextModule implements NestModule {
  static forRoot(options: HttpContextModuleOptions = {}): DynamicModule {
    const { enableDatabase } = options;

    return {
      module: HttpContextModule,
      imports: [CoreContextModule.forRoot({ enableDatabase })],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ErrorLoggingInterceptor,
        },
      ],
      exports: [CoreContextModule],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
