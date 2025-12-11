import type { IsStrictSnakeCase } from '@workspace/common';
import type { MessageType } from '@workspace/domain/src/codes/define-message-code-enum.utils';
import type { DomainCodeEnums } from '@workspace/domain/src/codes/domain-code.enums';

type ValidateTriggerCode<
  T extends string,
  M extends MessageType = 'trg',
> = T extends `${DomainCodeEnums['System']['Infra']}:${M}:${infer Action}`
  ? IsStrictSnakeCase<Action> extends true
    ? T // ✅
    : `[ Error: Action '${Action}' must be lower_snake_case ]` // ❌ 케이스가 틀림
  : `${DomainCodeEnums['System']['Infra']}:${M}:`;

/**
 * TriggerCode를 정의하고 검증합니다.
 * TriggerCode는 'system:infra' 도메인에 적용된 특수 메시지 코드입니다.
 * @example const code = defineTriggerCode('system:infra:trg:http');
 */
const defineTriggerCode = <const T extends string>(code: ValidateTriggerCode<T>): T =>
  code as unknown as T;

export const TriggerCodeEnums = {
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
} as const;

export type TriggerCodeEnum = typeof TriggerCodeEnums;
export type TriggerCode = ValidateTriggerCode<Extract<keyof TriggerCodeEnum, string>>;
