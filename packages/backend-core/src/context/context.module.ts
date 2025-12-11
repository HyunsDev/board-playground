import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core'; // Global Interceptor 등록용
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule } from 'nestjs-cls';

import { ContextService } from './context.service';
import { MessageCausationInterceptor } from './message-causation.interceptor';
import { PrismaModule } from '../database/prisma.module';
import { PrismaService } from '../database/prisma.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    ClsModule.forRoot({
      global: true,
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  providers: [
    ContextService,
    {
      provide: APP_INTERCEPTOR, // 추후 EventBusModule로 이동 고려
      useClass: MessageCausationInterceptor,
    },
  ],
  exports: [ContextService, ClsModule],
})
export class CoreContextModule {}
