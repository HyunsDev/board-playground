import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule, ClsPlugin } from 'nestjs-cls';

import {
  ClientContext,
  CoreContext,
  MessageContext,
  TokenContext,
  TransactionContext,
} from './contexts';
import { MessageInterceptor } from './interceptors/message.interceptor';
import { TransactionManager } from './transaction.manager';
import { PrismaService } from '../database/prisma.service';

import { DatabaseModule } from '@/modules/database/database.module';

export interface CoreContextModuleOptions {
  enableDatabase?: boolean;
}

@Global()
@Module({})
export class CoreContextModule {
  static forRoot(options: CoreContextModuleOptions = {}): DynamicModule {
    const { enableDatabase = true } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imports: any[] = [];
    const clsPlugins: ClsPlugin[] = [];
    const providers: Provider[] = [
      ClientContext,
      CoreContext,
      MessageContext,
      TokenContext,
      {
        provide: APP_INTERCEPTOR,
        useClass: MessageInterceptor,
      },
    ];
    const exports: Provider[] = [
      ClientContext,
      CoreContext,
      MessageContext,
      TokenContext,
      TransactionContext,
      ClsModule,
    ];

    if (enableDatabase) {
      imports.push(DatabaseModule);
      clsPlugins.push(
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      );
      providers.push(TransactionManager);
      providers.push(TransactionContext);
      exports.push(TransactionManager);
    }

    imports.push(
      ClsModule.forRoot({
        global: true,
        middleware: { mount: false },
        plugins: clsPlugins,
      }),
    );

    return {
      module: CoreContextModule,
      imports,
      providers,
      exports,
    };
  }
}
