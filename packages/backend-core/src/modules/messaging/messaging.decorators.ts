/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators, UseFilters, UsePipes } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RedisContext } from '@nestjs/microservices';

import { MessageConstructor } from '@workspace/backend-ddd';

import { MessageTransformPipe } from './message-transform.pipe';
import { GlobalRpcExceptionFilter } from './rpc-exception.filter';

import { BaseIntegrationEvent, BaseRpc } from '@/base';

/**
 * [RPC] 요청에 대한 응답을 처리하는 핸들러 (동기성)
 * 기존 @MessagePattern 대체
 */
export const HandleRpc = (rpc: MessageConstructor<BaseRpc<any, any, any>>) => {
  return applyDecorators(
    MessagePattern(rpc.code),
    UsePipes(new MessageTransformPipe(rpc)),
    UseFilters(new GlobalRpcExceptionFilter()),
  );
};

/**
 * [PUB] 발생한 이벤트를 수신하는 핸들러 (비동기성)
 * 기존 @EventPattern 대체
 */
export const HandlePub = (pub: MessageConstructor<BaseIntegrationEvent<any>>) => {
  return applyDecorators(
    EventPattern(pub.code),
    UsePipes(new MessageTransformPipe(pub)),
    UseFilters(new GlobalRpcExceptionFilter()),
  );
};

/**
 * 메시지의 본문(Data)을 추출합니다.
 * 기존 @Payload 대체
 */
export const MsgPayload = () => Payload();

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
