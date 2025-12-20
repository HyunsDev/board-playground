/* eslint-disable @typescript-eslint/no-explicit-any */
import { performance } from 'perf_hooks';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { DomainError, DomainResult, SystemException } from '@workspace/backend-ddd';
import { DomainCodeEnums } from '@workspace/domain';

import { SystemLogActionEnum } from '../types';
import { MeasureResult } from './instrumentation.types';
import { toCommandLogData } from './toCommandLogData';
import { toEventLogData } from './toEventLogData';
import { toQueryLogData } from './toQueryLogData';
import { systemLog } from '../helpers';

import { BaseCommand, BaseDomainEvent, BaseQuery } from '@/base';

const COMMAND_HANDLER_METADATA = '__commandHandler__';
const QUERY_HANDLER_METADATA = '__queryHandler__';
const EVENTS_HANDLER_METADATA = '__eventsHandler__';

const resultLogLevel = {
  Success: 'log',
  DomainError: 'warn',
  SystemException: 'error',
  UnexpectedException: 'error',
} as const;

@Injectable()
export class HandlerInstrumentation implements OnApplicationBootstrap {
  private readonly logger = new Logger(HandlerInstrumentation.name);

  constructor(private readonly discoveryService: DiscoveryService) {}

  onApplicationBootstrap() {
    this.wrapHandlers(COMMAND_HANDLER_METADATA, 'Command');
    this.wrapHandlers(QUERY_HANDLER_METADATA, 'Query');
    this.wrapHandlers(EVENTS_HANDLER_METADATA, 'Event');

    this.logger.log(
      systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.AppInitialize, {
        msg: 'Handler Instrumentation initialized: Handlers wrapped.',
      }),
    );
  }

  private wrapHandlers(metadataKey: string, type: 'Command' | 'Query' | 'Event') {
    const providers = this.discoveryService.getProviders();
    let wrappedCount = 0;

    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      // 메타데이터 확인
      const isHandler = Reflect.getMetadata(metadataKey, metatype);
      if (!isHandler) continue;

      // execute(Command/Query) 또는 handle(Event) 메서드 이름 결정
      const methodName = type === 'Event' ? 'handle' : 'execute';

      // 이미 래핑되었는지 확인
      const originalMethod = metatype.prototype[methodName];

      if (!originalMethod || (originalMethod as any).__wrapped__) continue;

      const handlerName = metatype.name || `Unknown${type}Handler`;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      // 메서드 교체

      metatype.prototype[methodName] = async function (message: any) {
        // 타입에 따라 적절한 로깅 메서드 호출
        if (type === 'Command') {
          return await self.measureAndLogCommand({
            message,
            executor: () => originalMethod.call(this, message),
          });
        } else if (type === 'Query') {
          return await self.measureAndLogQuery({
            message,
            executor: () => originalMethod.call(this, message),
          });
        } else {
          // Event
          return await self.measureAndLogEvent({
            message,
            handlerName,
            executor: () => originalMethod.call(this, message),
          });
        }
      };

      // 래핑 플래그 설정

      (metatype.prototype[methodName] as any).__wrapped__ = true;
      wrappedCount++;
    }

    if (wrappedCount > 0) {
      this.logger.log(`Wrapped ${wrappedCount} ${type}Handlers for instrumentation.`);
    }
  }

  private async measure(
    executor: () => Promise<DomainResult<unknown, DomainError>>,
  ): Promise<MeasureResult> {
    const start = performance.now();

    try {
      const result = await executor();
      const duration = (performance.now() - start).toFixed(0);

      if (result?.isErr()) {
        return {
          duration,
          result: 'DomainError',
          value: result,
          error: result.error,
        } as const;
      }

      return {
        duration,
        result: 'Success',
        value: result,
      } as const;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(0);

      if (error instanceof SystemException) {
        return {
          duration,
          result: 'SystemException',
          error,
        } as const;
      }

      return {
        duration,
        result: 'UnexpectedException',
        error,
      } as const;
    }
  }

  private async measureAndLogCommand({
    message,
    executor,
  }: {
    message: BaseCommand<any, any, any>;
    executor: () => Promise<any>;
  }) {
    const result = await this.measure(executor);
    const targetName = message?.constructor?.name || 'UnknownCommand';
    const logLevel = resultLogLevel[result.result];
    this.logger[logLevel](toCommandLogData(result, message), targetName);

    if (result.result !== 'Success' && result.result !== 'DomainError') {
      throw result.error;
    }
    return result.value;
  }

  private async measureAndLogQuery({
    message,
    executor,
  }: {
    message: BaseQuery<any, any, any>;
    executor: () => Promise<any>;
  }) {
    const result = await this.measure(executor);
    const targetName = message?.constructor?.name || 'UnknownQuery';
    const logLevel = resultLogLevel[result.result];
    this.logger[logLevel](toQueryLogData(result, message), targetName);

    if (result.result !== 'Success' && result.result !== 'DomainError') {
      throw result.error;
    }
    return result.value;
  }

  private async measureAndLogEvent({
    message,
    executor,
    handlerName,
  }: {
    message: BaseDomainEvent<any>;
    executor: () => Promise<any>;
    handlerName: string;
  }) {
    const result = await this.measure(executor);
    const targetName = message?.constructor?.name || 'UnknownEvent';
    const logLevel = resultLogLevel[result.result];
    this.logger[logLevel](toEventLogData(result, message, handlerName), targetName);

    if (result.result !== 'Success' && result.result !== 'DomainError') {
      throw result.error;
    }
    return result.value;
  }
}
