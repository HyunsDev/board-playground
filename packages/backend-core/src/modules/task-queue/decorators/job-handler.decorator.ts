/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, Logger, SetMetadata } from '@nestjs/common';

import { MessageConstructor } from '@workspace/backend-ddd';

import { InvalidHandlerException, LogTypeEnum, toJobLogData } from '../../logging';
import { measureAndLog } from '../../logging/instrumentations/measure.utils';
import { JOB_HANDLER_METADATA } from '../job.contants';

import { BaseJob } from '@/base';

export const JobHandler = (job: MessageConstructor<BaseJob<any>>) => {
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

    target.prototype.execute = async function (...args: any[]) {
      const message = args[0];

      return await measureAndLog({
        logType: LogTypeEnum.Job,
        message: message,
        executor: async () => await originalMethod.apply(this, args),
        toLogData: toJobLogData,
        handlerName: target.name,
        logger: logger,
      });
    };
  };

  return applyDecorators(SetMetadata(JOB_HANDLER_METADATA, job), instrumentation);
};
