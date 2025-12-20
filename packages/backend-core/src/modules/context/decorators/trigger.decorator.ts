import { SetMetadata } from '@nestjs/common';

import { TriggerCode } from '@workspace/domain';

import { TRIGGER_KEY } from '../context.constants';

/**
 * 해당 요청의 실행 트리거(TriggerCode)를 명시적으로 설정합니다.
 * 기본적으로 HTTP 요청은 'system:infra:trg:http'로 간주되지만,
 * Webhook이나 다른 진입점인 경우 이 데코레이터로 덮어씁니다.
 *
 * @example @Trigger(TriggerCodeEnum.Webhook)
 */
export const Trigger = (trigger: TriggerCode) => SetMetadata(TRIGGER_KEY, trigger);
