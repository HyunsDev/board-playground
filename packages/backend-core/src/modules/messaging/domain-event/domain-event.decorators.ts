/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, Logger } from '@nestjs/common';
import { EventsHandler as NestEventHandler } from '@nestjs/cqrs';

import { MessageConstructor } from '@workspace/backend-ddd';

import { BaseDomainEvent } from '@/base';
import {
  InvalidHandlerException,
  LogTypeEnum,
  toEventLogData,
  measureAndLog,
} from '@/modules/observability/logging';

export const DomainEventsHandler = (...events: MessageConstructor<BaseDomainEvent<any>>[]) => {
  const instrumentation: MethodDecorator = (
    target: any,
    _propertyKey: string | symbol,
    _descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = target.prototype.handle;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new InvalidHandlerException(
        `${target.name} 클래스에 'handle' 메소드가 없어 계측을 적용할 수 없습니다.`,
      );
    }
    const logger = new Logger(target.name as string);

    // 3. handle 메소드를 래핑합니다.
    target.prototype.handle = async function (...args: any[]) {
      const message = args[0];

      return await measureAndLog({
        logType: LogTypeEnum.Event,
        message: message,
        executor: async () => await originalMethod.apply(this, args),
        toLogData: toEventLogData,
        handlerName: target.name,
        logger: logger,
      });
    };
  };

  return applyDecorators(NestEventHandler(...events), instrumentation);
};
