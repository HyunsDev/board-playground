import type { ExtractEnumValues } from '@workspace/common';

import type { ValidateUnitCode } from './unit-code.utils';
import type { DomainCodeEnums } from 'dist';

const defineTriggerCode = <const T extends string>(
  code: ValidateUnitCode<T, 'trg', DomainCodeEnums['System']['Infra']>,
): T => code as unknown as T;

export const TriggerCodeEnum = {
  // HTTP
  Http: defineTriggerCode('system:infra:trg:http'), // 일반적인 API 요청
  Webhook: defineTriggerCode('system:infra:trg:webhook'), // 외부 솔루션 웹훅
  WebSocket: defineTriggerCode('system:infra:trg:websocket'), // 웹소켓 이벤트

  // Infra
  Scheduler: defineTriggerCode('system:infra:trg:scheduler'), // 크론잡
  SystemBoot: defineTriggerCode('system:infra:trg:system_boot'), // 서버 시작 시 실행
  Console: defineTriggerCode('system:infra:trg:console'), // 콘솔 명령어 실행

  // External
  MessageQueue: defineTriggerCode('system:infra:trg:mq'), // 메시지 큐 이벤트

  // Debug
  Test: defineTriggerCode('system:infra:trg:test'), // 테스트 용도

  // Unknown
  Unknown: defineTriggerCode('system:infra:trg:unknown'), // 알 수 없는 트리거
} as const;

export type TriggerCodeEnum = typeof TriggerCodeEnum;
export type TriggerCode = ExtractEnumValues<TriggerCodeEnum>;
