/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, Logger } from '@nestjs/common';
import {
  QueryHandler as NestQueryHandler,
  CommandHandler as NestCommandHandler,
} from '@nestjs/cqrs';

import { MessageConstructor } from '@workspace/backend-ddd';

import { InvalidHandlerException, LogTypeEnum, toCommandLogData, toQueryLogData } from '../logging';
import { measureAndLog } from '../logging/instrumentations/measure.utils';

import { BaseCommand, BaseCommandProps, BaseQuery, BaseQueryProps } from '@/base';

export const QueryHandler = <
  T extends MessageConstructor<BaseQuery<BaseQueryProps<any>, any, any>>,
>(
  query: T,
) => {
  const instrumentation: MethodDecorator = (
    target: any,
    _propertyKey: string | symbol,
    _descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = target.prototype.execute;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new InvalidHandlerException(
        `${target.name} 클래스에 'execute' 메소드가 없어 계측을 적용할 수 없습니다.`,
      );
    }
    const logger = new Logger(target.name as string);

    // 3. handle 메소드를 래핑합니다.
    target.prototype.execute = async function (...args: any[]) {
      const message = args[0];

      return await measureAndLog({
        logType: LogTypeEnum.Query,
        message: message,
        executor: async () => await originalMethod.apply(this, args),
        toLogData: toQueryLogData,
        handlerName: target.name,
        logger: logger,
      });
    };
  };

  return applyDecorators(NestQueryHandler(query), instrumentation);
};

export const CommandHandler = <
  T extends MessageConstructor<BaseCommand<BaseCommandProps<any>, any, any>>,
>(
  command: T,
) => {
  const instrumentation: MethodDecorator = (
    target: any,
    _propertyKey: string | symbol,
    _descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = target.prototype.execute;

    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new InvalidHandlerException(
        `${target.name} 클래스에 'execute' 메소드가 없어 계측을 적용할 수 없습니다.`,
      );
    }
    const logger = new Logger(target.name as string);

    // 3. handle 메소드를 래핑합니다.
    target.prototype.execute = async function (...args: any[]) {
      const message = args[0];

      return await measureAndLog({
        logType: LogTypeEnum.Command,
        message: message,
        executor: async () => await originalMethod.apply(this, args),
        toLogData: toCommandLogData,
        handlerName: target.name,
        logger: logger,
      });
    };
  };
  return applyDecorators(NestCommandHandler(command), instrumentation);
};
