import { TriggerCodeRecord } from '../types/code-record.types';

/**
 * 이 요청이 무엇이 의해서 실행됬는지를 나타냅니다.
 * 주로 causationCode에 포함되어 로깅 및 추적에 사용됩니다.
 */
export const TriggerCodes = {
  Infra: {
    HttpRequest: 'infra.trigger.http-request', // 일반적인 API 요청
    Scheduler: 'infra.trigger.scheduler', // 크론잡
    Webhook: 'infra.trigger.webhook', // 외부 솔루션 웹훅
    SystemBoot: 'infra.trigger.system-boot', // 서버 시작 시 실행
  },
} as const satisfies Record<'Infra', TriggerCodeRecord>;

export type TriggerCode = (typeof TriggerCodes)[keyof typeof TriggerCodes];
