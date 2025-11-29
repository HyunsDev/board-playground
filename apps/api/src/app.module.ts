import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule, ClsService } from 'nestjs-cls';

import { envSchema } from './config/env.validation';
import { AuthModule } from './domains/auth/auth.module';
import { ClientInfoMiddleware } from './domains/cls/middlewares/client-info.middleware';
import { RequestIdMiddleware } from './domains/cls/middlewares/request-id.middleware';
import { DeviceModule } from './domains/device/device.module';
import { HelloModule } from './domains/hello/hello.module';
import { UserModule } from './domains/user/user.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { SecurityModule } from './infra/security/security.module';
import { GlobalExceptionsFilter } from './libs/application/filters/global-exception.filer';
import { ClsAccessor } from './libs/cls';

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
