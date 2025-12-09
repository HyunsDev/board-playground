import { Global, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Request } from 'express';
import { ClsModule } from 'nestjs-cls';
import { v7 as uuidv7 } from 'uuid';

import { ContextService } from './context.service';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';
import { MessageCausationInterceptor } from './interceptors/message-causation.interceptor';

import { TriggerCodes } from '@/shared/codes/trigger.codes';

const interceptors: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: RequestIdInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ErrorLoggingInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: MessageCausationInterceptor,
  },
];

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => (req.headers['x-request-id'] as string) ?? uuidv7(),
        setup: (cls, req: Request) => {
          const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            req.ip ||
            '0.0.0.0';
          const userAgent = req.get('user-agent') || 'unknown';
          cls.set('client', { ipAddress, userAgent });

          const requestType = TriggerCodes.Infra.HttpRequest;
          cls.set('triggerType', requestType);
        },
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: DatabaseService,
          }),
        }),
      ],
    }),
  ],
  providers: [ContextService, ...interceptors],
  exports: [ContextService],
})
export class ContextModule {}
