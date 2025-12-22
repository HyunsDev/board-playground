import {
  DynamicModule,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  RequestMethod,
} from '@nestjs/common';
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
import { HttpApiErrorLoggingInterceptor } from './interceptors/http-api-error-logging.interceptor';
import { MessageInterceptor } from './interceptors/message.interceptor';
import { ContextMiddleware } from './middlewares/context.middleware';
import { TransactionManager } from './transaction.manager';
import { PrismaService } from '../../persistence/database/prisma.service';

import { DatabaseModule } from '@/modules/persistence/database/database.module';

/**
 * 모듈 설정 옵션
 */
export interface ContextModuleOptions {
  /**
   * 실행 환경 타입
   * - 'http': HTTP 요청 처리 (Express/Fastify) - Middleware 및 Logging Interceptor 적용
   * - 'worker': 백그라운드 작업, Cron 등 - Middleware 미적용
   */
  type: 'http' | 'worker';

  /**
   * 데이터베이스(Prisma) 트랜잭션 컨텍스트 활성화 여부
   * @default true
   */
  enableDatabase?: boolean;
}

const CONTEXT_MODULE_OPTIONS = Symbol('CONTEXT_MODULE_OPTIONS');

@Global()
@Module({})
export class ContextModule implements NestModule {
  constructor(@Inject(CONTEXT_MODULE_OPTIONS) private readonly options: ContextModuleOptions) {}

  static forRoot(options: ContextModuleOptions): DynamicModule {
    const { enableDatabase = true, type } = options;

    // 1. 기본 Providers (Context 프록시 객체들)
    const providers: Provider[] = [
      ClientContext,
      CoreContext,
      MessageContext,
      TokenContext,
      {
        provide: CONTEXT_MODULE_OPTIONS,
        useValue: options,
      },
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
      ClsModule,
    ];

    // 2. HTTP 전용 Interceptor 추가
    if (type === 'http') {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: HttpApiErrorLoggingInterceptor,
      });
    }

    // 3. Database & Transaction 관련 설정
    const imports: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const clsPlugins: ClsPlugin[] = [];

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
      providers.push(TransactionManager, TransactionContext);
      exports.push(TransactionManager, TransactionContext);
    }

    // 4. CLS 모듈 설정
    imports.push(
      ClsModule.forRoot({
        global: true,
        middleware: { mount: false },
        plugins: clsPlugins,
      }),
    );

    return {
      module: ContextModule,
      imports,
      providers,
      exports,
    };
  }

  /**
   * NestModule 인터페이스 구현
   * HTTP 타입일 경우에만 ContextMiddleware를 적용합니다.
   */
  configure(consumer: MiddlewareConsumer) {
    if (this.options.type === 'http') {
      consumer.apply(ContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
  }
}
