import { Global, Module } from '@nestjs/common';

import {
  ConfigModule,
  DatabaseModule,
  DomainEventModule,
  LoggingModule,
  AccessControlModule,
  HealthModule,
  CacheModule,
  accessTokenConfig,
  httpConfig,
  prismaConfig,
  redisConfig,
  TaskQueueModule,
  ssmConfig,
  StorageModule,
  StorageWorkerModule,
  MicroservicesModule,
  CqrsModule,
  SseModule,
  ContextModule,
  mailerConfig,
  MailerModule,
  AuditLogModule,
} from '@workspace/backend-core';

import { discordWebhookConfig } from './configs';
import { refreshTokenConfig } from './configs/refresh-token.config';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      extraLoad: [
        httpConfig,
        prismaConfig,
        accessTokenConfig,
        redisConfig,
        ssmConfig,
        mailerConfig,

        refreshTokenConfig,
        discordWebhookConfig,
      ],
    }),
    ContextModule.forRoot({
      enableDatabase: true,
      type: 'http',
    }),
    TaskQueueModule.forRoot(),
    DatabaseModule,
    CacheModule,
    StorageModule,
    StorageWorkerModule,
    DomainEventModule,
    LoggingModule,
    MicroservicesModule,
    CqrsModule,
    AccessControlModule.forRoot({
      enableGlobalAuthGuard: true,
    }),
    ExceptionFilterModule,
    HealthModule.forRoot({
      exposeHttp: true,
      check: {
        prisma: true,
        redis: true,
      },
    }),
    SseModule.forServer(),
    MailerModule.forSend(),
    AuditLogModule,
  ],
  exports: [
    ContextModule,
    DatabaseModule,
    DomainEventModule,
    LoggingModule,
    AccessControlModule,
    CqrsModule,
  ],
})
export class CoreModule {}
