import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { ClsAccessor } from './cls-accessor';
import { ClientInfoMiddleware } from './middlewares/client-info.middleware';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';

@Global()
@Module({
  providers: [ClsAccessor],
  exports: [ClsAccessor],
})
export class ClsModule implements NestModule {
  constructor(private readonly cls: ClsService) {
    ClsAccessor.setClsService(this.cls);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer.apply(ClientInfoMiddleware).forRoutes('*');
  }
}
