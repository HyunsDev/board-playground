import { performance } from 'perf_hooks';

import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

import {
  CommandHandledLogData,
  EventHandledLogData,
  EventPublishedLogData,
  LogTypes,
  QueryHandledLogData,
} from './logger.types';

import { BaseCommand, BaseDomainEvent, BaseQuery, MessageMetadata } from '@/shared/base';

/**
 * `@EventsHandler` 데코레이터의 메타데이터 키
 * @see https://github.com/nestjs/cqrs/blob/master/src/decorators/constants.ts#L6
 */
const EVENTS_HANDLER_METADATA = '__eventsHandler__';

@Injectable()
export class CqrsLoggingService implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(CqrsLoggingService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit() {
    this.wrapCommandExecute(this.commandBus);
    this.wrapQueryBusExecute(this.queryBus);
    this.wrapEventBusPublish(this.eventBus);
    this.logger.log(`Dependencies initialized. Wrapped CQRS buses for logging.`);
  }

  onApplicationBootstrap() {
    this.wrapEventHandlers();
  }

  private wrapCommandExecute(bus: CommandBus) {
    const originalExecute: any = bus.execute.bind(bus);

    // eslint-disable-next-line functional/no-expression-statements
    bus.execute = async <T extends BaseCommand<any, any, any>, R>(command: T): Promise<R> => {
      const start = performance.now();
      const commandName = command?.constructor?.name || 'UnknownCommand';
      const metadata = this.extractMetadata(command);

      try {
        const result = await originalExecute(command);
        const duration = (performance.now() - start).toFixed(0);

        if (result && typeof (result as any).isErr === 'function' && (result as any).isErr()) {
          const { error } = result as any;
          this.logger.warn(
            {
              type: LogTypes.CommandHandled,
              action: command.code,
              duration,
              isError: true,
              error,
              ...metadata,
            } satisfies CommandHandledLogData,
            commandName,
          );
        } else {
          // 성공 시
          this.logger.log(
            {
              type: LogTypes.CommandHandled,
              action: command.code,
              duration,
              isError: false,
              ...metadata,
            } satisfies CommandHandledLogData,
            commandName,
          );
        }

        return result;
      } catch (error: any) {
        // 예상치 못한 예외 (System Error)
        const duration = (performance.now() - start).toFixed(0);
        this.logger.error(
          {
            type: LogTypes.CommandHandled,
            action: command.code,
            duration,
            isError: true,
            error,
            ...metadata,
          } satisfies CommandHandledLogData,
          commandName,
        );
        throw error;
      }
    };

    this.logger.log(`Wrapped {CommandBus} for logging`);
  }

  private wrapQueryBusExecute(bus: QueryBus) {
    const originalExecute: any = bus.execute.bind(bus);
    // eslint-disable-next-line functional/no-expression-statements
    bus.execute = async <T extends BaseQuery<any, any, any>, R>(query: T): Promise<R> => {
      const start = performance.now();
      const queryName = query?.constructor?.name || 'UnknownQuery';

      try {
        const result = await originalExecute(query);
        const duration = (performance.now() - start).toFixed(0);

        if (result && typeof (result as any).isErr === 'function' && (result as any).isErr()) {
          const { error } = result as any;
          this.logger.warn(
            {
              type: LogTypes.QueryHandled,
              action: query.code,
              duration,
              isError: true,
              queryData: query.data,
              error,
              ...this.extractMetadata(query),
            } satisfies QueryHandledLogData,
            queryName,
          );
        } else {
          if (Number(duration) > 1000) {
            // 느린 쿼리
            this.logger.warn(
              {
                type: LogTypes.QueryHandled,
                action: query.code,
                duration,
                isError: false,
                queryData: query.data,
                ...this.extractMetadata(query),
              } satisfies QueryHandledLogData,
              `[SLOW QUERY] ${queryName}`,
            );
          } else {
            // 성공 시
            this.logger.debug(
              {
                type: LogTypes.QueryHandled,
                action: query.code,
                duration,
                isError: false,
                queryData: query.data,
                ...this.extractMetadata(query),
              } satisfies QueryHandledLogData,
              queryName,
            );
          }
        }

        return result;
      } catch (error: any) {
        // 예상치 못한 예외 (System Error)
        const duration = (performance.now() - start).toFixed(0);
        this.logger.error(
          {
            duration,
            err: error,
          },
          queryName,
        );
        throw error;
      }
    };

    this.logger.log(`Wrapped {QueryBus} for logging`);
  }

  private wrapEventBusPublish(bus: EventBus) {
    const originalPublish = bus.publish.bind(bus);
    const originalPublishAll = bus.publishAll.bind(bus);

    // eslint-disable-next-line functional/no-expression-statements
    bus.publish = <T extends BaseDomainEvent>(event: T) => {
      const eventName = (event as any)?.constructor?.name || 'UnknownEvent';
      const metadata = this.extractMetadata(event);
      this.logger.debug(
        {
          type: LogTypes.EventPublished,
          action: event.code,
          ...metadata,
        } satisfies EventPublishedLogData,
        eventName,
      ); // 단순 발행 로그
      return originalPublish(event);
    };

    // eslint-disable-next-line functional/no-expression-statements
    bus.publishAll = <T extends BaseDomainEvent>(events: T[]) => {
      events.forEach((event) => {
        const eventName = (event as any)?.constructor?.name || 'UnknownEvent';
        const metadata = this.extractMetadata(event);
        this.logger.debug(
          {
            type: LogTypes.EventPublished,
            action: event.code,
            ...metadata,
          } satisfies EventPublishedLogData,
          eventName,
        ); // 단순 발행 로그
      });
      return originalPublishAll(events);
    };

    this.logger.log(`Wrapped {EventBus} for logging`);
  }

  private wrapEventHandlers() {
    const providers = this.discoveryService.getProviders();
    let wrappedCount = 0;

    providers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;

      // 1. 인스턴스와 메타타입이 존재하는지 먼저 확인
      if (!instance || !metatype) return;

      // 2. [중요] instance 속성을 건드리기 전에, 메타데이터(@EventsHandler)가 있는지 먼저 확인!
      // 여기서 아니면 리턴하므로, nestjs-cls의 Proxy Provider 등을 안전하게 건너뜁니다.
      const isEventHandler = Reflect.getMetadata(EVENTS_HANDLER_METADATA, metatype);
      if (!isEventHandler) return;

      // 3. 이제 안전하게 handle 메소드 존재 여부 확인
      if (metatype.prototype.handle && (metatype.prototype.handle as any).__wrapped__) {
        return;
      }

      const handlerName = metatype.name || 'UnknownEventHandler';
      const originalHandle = metatype.prototype.handle;
      this.logger.debug(`Wrapping EventHandler: ${handlerName}`);

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const serviceThis = this; // CqrsLoggingService의 this 캡처

      // eslint-disable-next-line functional/no-expression-statements
      metatype.prototype.handle = async function (event: BaseDomainEvent) {
        const start = performance.now();
        const eventName = event?.constructor?.name || 'UnknownEvent';
        const metadata = serviceThis.extractMetadata(event);

        try {
          /**
           * 원본 함수 실행시 실행 환경(ex: this.userRepository)의 this 바인딩.
           */
          const result = await originalHandle.call(this, event);

          const duration = (performance.now() - start).toFixed(0);

          if (result && typeof result.isErr === 'function' && result.isErr()) {
            serviceThis.logger.warn(
              {
                type: LogTypes.EventHandled,
                action: event.code,
                handlerName,
                duration,
                isError: true,
                error: result.error,
                ...metadata,
              } satisfies EventHandledLogData,
              `[Handle] ${eventName}`,
            );
          } else {
            serviceThis.logger.log(
              {
                type: LogTypes.EventHandled,
                action: event.code,
                handlerName,
                duration,
                isError: false,
                ...metadata,
              } satisfies EventHandledLogData,
              `[Handle] ${eventName}`,
            );
          }
          return result;
        } catch (error: any) {
          const duration = (performance.now() - start).toFixed(0);
          serviceThis.logger.error(
            {
              type: LogTypes.EventHandled,
              action: event.code,
              handlerName,
              duration,
              isError: true,
              error,
              ...metadata,
            } satisfies EventHandledLogData,
            `[Handle] ${eventName}`,
          );
          throw error;
        }
      };

      /**
       * 중복 래핑 방지 플래그 설정
       */
      // eslint-disable-next-line functional/no-expression-statements
      metatype.prototype.handle.__wrapped__ = true;
      void wrappedCount++;
    });

    if (wrappedCount > 0) {
      this.logger.log(
        `Dependencies initialized. Wrapped (${wrappedCount}) CQRS EventHandlers for logging.`,
      );
    } else {
      this.logger.warn(`No CQRS Event Handlers found to wrap.`);
    }
  }

  private extractMetadata(
    message: BaseQuery<any, any, any> | BaseCommand<any, any, any> | BaseDomainEvent,
  ): MessageMetadata {
    return message.metadata;
  }
}
