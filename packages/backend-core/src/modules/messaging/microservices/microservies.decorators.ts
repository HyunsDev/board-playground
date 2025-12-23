/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RedisContext, EventPattern } from '@nestjs/microservices';
import { ClsInterceptor } from 'nestjs-cls';

import { MessageConstructor } from '@workspace/backend-ddd';

import { GlobalRpcExceptionFilter } from './rpc-exception.filter';

import { BaseIntegrationEvent, BaseRpc } from '@/base';
import { MessageTransformPipe, SetRequestIdFromMessagePipe } from '@/common/message';
import {
  LogTypeEnum,
  toIntegrationEventLogData,
  toRpcLogData,
  measureAndLog,
} from '@/modules/observability/logging';

/**
 * [RPC] 요청에 대한 응답을 처리하는 핸들러 (동기성)
 * 기존 @MessagePattern 대체
 */
export const RpcHandler = (rpc: MessageConstructor<BaseRpc<any, any, any>>) => {
  const instrumentation: MethodDecorator = (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${String(propertyKey)}`);

    descriptor.value = async function (...args: any[]) {
      return await measureAndLog({
        logType: LogTypeEnum.Rpc,
        message: args[0],
        executor: async () => await originalMethod.apply(this, args),
        toLogData: toRpcLogData,
        handlerName: String(propertyKey),
        logger: logger,
      });
    };

    return descriptor;
  };

  // 2. 데코레이터 합성
  return applyDecorators(
    instrumentation,
    MessagePattern(rpc.code),
    UseInterceptors(ClsInterceptor),
    UsePipes(MessageTransformPipe(rpc)),
    UsePipes(SetRequestIdFromMessagePipe()),
    UseFilters(new GlobalRpcExceptionFilter()),
  );
};

/**
 * [PUB] 발생한 이벤트를 수신하는 핸들러 (비동기성)
 * 기존 @EventPattern 대체
 */
export const IntegrationEventHandler = (pub: MessageConstructor<BaseIntegrationEvent<any>>) => {
  const instrumentation: MethodDecorator = (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}.${String(propertyKey)}`);

    descriptor.value = async function (...args: any[]) {
      return await measureAndLog({
        logType: LogTypeEnum.IntegrationEvent,
        message: args[0], // 첫 번째 인자를 메시지(DTO)로 가정
        executor: async () => await originalMethod.apply(this, args), // this 바인딩 유지
        toLogData: toIntegrationEventLogData,
        handlerName: String(propertyKey),
        logger: logger,
      });
    };

    return descriptor;
  };

  // 2. 데코레이터 합성
  return applyDecorators(
    instrumentation,
    EventPattern(pub.code),
    UseInterceptors(ClsInterceptor),
    UsePipes(MessageTransformPipe(pub)),
    UsePipes(SetRequestIdFromMessagePipe()),
    UseFilters(new GlobalRpcExceptionFilter()),
  );
};

/**
 * 메시지의 본문(Data)을 추출합니다.
 * 기존 @Payload 대체
 */
const MsgPayload = () => Payload();

export const Rpc = MsgPayload;
export const Pub = MsgPayload;

/**
 * 메시지의 컨텍스트(Redis 정보 등)를 추출합니다.
 * 기존 @Ctx 대체
 */
export const MsgCtx = () => Ctx();

/**
 * [Type] 메시징 컨텍스트 타입 재정의
 * 사용하는 쪽에서 RedisContext를 직접 import 하지 않도록 합니다.
 */
export type MessagingContext = RedisContext;
