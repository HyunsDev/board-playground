import { performance } from 'perf_hooks';

import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

import { EventPublishedLogData, LogType, LogTypes } from './log.types';

import { BaseDomainEvent } from '@/shared/base';

const EVENTS_HANDLER_METADATA = '__eventsHandler__';

/**
 * CQRS 버스 및 핸들러의 실행을 가로채어(Intercept)
 * 실행 시간(Duration)을 측정하고, 성공/실패 여부를 구조화된 로그로 남기는 인스트루멘테이션 클래스입니다.
 */
@Injectable()
export class CqrsInstrumentation implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(CqrsInstrumentation.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit() {
    this.wrapBus(this.commandBus, 'execute', LogTypes.CommandHandled);
    this.wrapBus(this.queryBus, 'execute', LogTypes.QueryHandled);

    // EventBus는 publish와 publishAll 두 가지를 감싸야 합니다.
    this.wrapEventBusPublish(this.eventBus);

    this.logger.log('CQRS Instrumentation initialized: Buses wrapped.');
  }

  onApplicationBootstrap() {
    this.wrapEventHandlers();
  }

  /**
   * CommandBus / QueryBus의 실행 메서드를 래핑합니다.
   */
  private wrapBus(bus: any, methodName: string, logType: LogType) {
    const originalMethod = bus[methodName].bind(bus);

    // eslint-disable-next-line functional/no-expression-statements
    bus[methodName] = async (message: any) => {
      return this.measureAndLog({
        type: logType,
        message,
        executor: () => originalMethod(message),
        nameFallback: 'UnknownMessage',
      });
    };
  }

  /**
   * EventBus의 publish 계열 메서드를 래핑합니다.
   */
  private wrapEventBusPublish(bus: EventBus) {
    const originalPublish = bus.publish.bind(bus);
    const originalPublishAll = bus.publishAll.bind(bus);

    // eslint-disable-next-line functional/no-expression-statements
    bus.publish = <T extends BaseDomainEvent>(event: T) => {
      this.logEventPublish(event);
      return originalPublish(event);
    };

    // eslint-disable-next-line functional/no-expression-statements
    bus.publishAll = <T extends BaseDomainEvent>(events: T[]) => {
      events.forEach((event) => this.logEventPublish(event));
      return originalPublishAll(events);
    };
  }

  private logEventPublish(event: BaseDomainEvent) {
    const eventName = event?.constructor?.name || 'UnknownEvent';
    this.logger.debug(
      {
        type: LogTypes.EventPublished,
        action: event.code,
        ...event.metadata,
      } satisfies EventPublishedLogData,
      eventName,
    );
  }

  /**
   * 모든 EventHandler를 찾아서 래핑합니다.
   */
  private wrapEventHandlers() {
    const providers = this.discoveryService.getProviders();
    let wrappedCount = 0;

    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      // Reflector를 사용해 메타데이터 확인 (없으면 패스)
      const isEventHandler = Reflect.getMetadata(EVENTS_HANDLER_METADATA, metatype);
      if (!isEventHandler) continue;

      // 이미 래핑되었는지 확인
      const originalHandle = metatype.prototype.handle;
      if (!originalHandle || (originalHandle as any).__wrapped__) continue;

      const handlerName = metatype.name || 'UnknownEventHandler';

      // handle 메서드 교체
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      // eslint-disable-next-line functional/no-expression-statements
      metatype.prototype.handle = async function (event: BaseDomainEvent) {
        return self.measureAndLog({
          type: LogTypes.EventHandled,
          message: event,
          // 중요: this 컨텍스트를 유지하며 호출
          executor: () => originalHandle.call(this, event),
          nameFallback: 'UnknownEvent',
          handlerName,
        });
      };

      // eslint-disable-next-line functional/no-expression-statements
      metatype.prototype.handle.__wrapped__ = true;
      // eslint-disable-next-line functional/no-expression-statements
      wrappedCount++;
    }

    if (wrappedCount > 0) {
      this.logger.log(`Wrapped ${wrappedCount} EventHandlers for instrumentation.`);
    }
  }

  /**
   * [Core Logic] 실행 시간을 측정하고, 결과(Success/Failure/Exception)에 따라 로깅을 수행하는 통합 함수
   */
  private async measureAndLog(params: {
    type: LogType;
    message: any;
    executor: () => Promise<any>;
    nameFallback: string;
    handlerName?: string;
  }) {
    const { type, message, executor, nameFallback, handlerName } = params;
    const start = performance.now();
    const targetName = message?.constructor?.name || nameFallback;
    const metadata = message.metadata || {};

    try {
      // 1. 실제 로직 실행
      const result = await executor();
      const duration = (performance.now() - start).toFixed(0);

      // 2. 결과 검사 (Neverthrow Result 패턴 확인)
      const isResultError = result && typeof result.isErr === 'function' && result.isErr();

      const logPayload = {
        type,
        action: message.code,
        duration,
        isError: isResultError,
        handlerName, // EventHandler일 경우에만 존재
        ...metadata,
      };

      if (isResultError) {
        // [비즈니스 에러] Result.err() 반환 시 (Warn 레벨)
        this.logger.warn({ ...logPayload, error: result.error }, targetName);
      } else {
        // [성공] (Slow Query 감지 로직 포함)
        if (type === LogTypes.QueryHandled && Number(duration) > 1000) {
          this.logger.warn({ ...logPayload, queryData: message.data }, `[SLOW] ${targetName}`);
        } else {
          // 일반적인 성공 로그는 Debug/Log 레벨
          this.logger.log(
            { ...logPayload, queryData: type === LogTypes.QueryHandled ? message.data : undefined },
            targetName,
          );
        }
      }

      return result;
    } catch (error) {
      // [시스템 에러] 예외 발생 시 (Error 레벨)
      const duration = (performance.now() - start).toFixed(0);
      this.logger.error(
        {
          type,
          action: message.code,
          duration,
          isError: true,
          error,
          handlerName,
          ...metadata,
        },
        targetName,
      );
      throw error;
    }
  }
}
