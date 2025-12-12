import { Global, Module } from '@nestjs/common'; // 👈 Global 임포트 확인
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule } from 'nestjs-cls';

import { ContextService } from './context.service';
import { MessageCausationInterceptor } from './message-causation.interceptor';
import { TransactionManager } from './transaction.manager';
import { PrismaService } from '../database/prisma.service';

import { DatabaseModule } from '@/database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  providers: [
    ContextService,
    TransactionManager,
    {
      provide: APP_INTERCEPTOR,
      useClass: MessageCausationInterceptor,
    },
  ],
  exports: [ContextService, ClsModule, TransactionManager],
})
export class CoreContextModule {}
