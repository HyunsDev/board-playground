// src/common/logger/cqrs-logger.service.ts

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Subject, takeUntil } from 'rxjs';

import { BaseCommand, BaseDomainEvent, BaseQuery } from '@/shared/base';

@Injectable()
export class CqrsLoggerService implements OnModuleInit, OnModuleDestroy {
  // 메모리 누수 방지를 위한 구독 해제용 Subject
  private destroy$ = new Subject<void>();

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    // pino-logger 주입
    @InjectPinoLogger(CqrsLoggerService.name)
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit() {
    // 1. CommandBus 로깅
    void this.commandBus.pipe(takeUntil(this.destroy$)).subscribe((command) => {
      this.logMessage('CommandBus', command as BaseCommand<any, any, any>);
    });

    // 2. QueryBus 로깅
    void this.queryBus.pipe(takeUntil(this.destroy$)).subscribe((query) => {
      this.logMessage('QueryBus', query as BaseQuery<any, any, any>);
    });

    // 3. EventBus 로깅
    void this.eventBus.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.logMessage('EventBus', event as BaseDomainEvent);
    });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private logMessage(
    context: string,
    message: BaseCommand<any, any, any> | BaseQuery<any, any, any> | BaseDomainEvent<any>,
  ) {
    this.logger.info(
      {
        context,
        code: message.code,
        name: message.constructor.name,
        payload: message,
      },
      `[${message.constructor.name}] dispatched`,
    );
  }
}
