import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule, ClsService } from 'nestjs-cls';

import { envSchema } from './config/env.validation';
import { GlobalExceptionsFilter } from './libs/application/filters/global-exception.filer';
import { ClsAccessor } from './libs/cls';
import { AuthModule } from './modules/auth/auth.module';
import { ClientInfoMiddleware } from './modules/cls/middlewares/client-info.middleware';
import { RequestIdMiddleware } from './modules/cls/middlewares/request-id.middleware';
import { DeviceModule } from './modules/device/device.module';
import { HelloModule } from './modules/hello/hello.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SecurityModule } from './modules/security/security.module';
import { UserModule } from './modules/user/user.module';

const filters = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionsFilter,
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const parsed = envSchema.safeParse(env);
        if (!parsed.success) {
          console.error(parsed.error.format());
          throw new Error('❌ Invalid environment variables');
        }
        return parsed.data;
      },
    }),
    EventEmitterModule.forRoot(),
    CqrsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    PrismaModule,
    SecurityModule,
    HelloModule,
    UserModule,
    DeviceModule,
    AuthModule,
  ],
  controllers: [],
  providers: [...filters],
})
export class AppModule {
  constructor(private readonly cls: ClsService) {
    ClsAccessor.setClsService(this.cls);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
    consumer.apply(ClientInfoMiddleware).forRoutes('*');
  }
}
