import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { TriggerCode } from '@workspace/domain';

import { TRIGGER_KEY } from '../context.constants';
import { TriggerContextInterceptor } from './trigger-context.pipe';

/**
 * 해당 요청의 실행 트리거(TriggerCode)를 명시적으로 설정합니다.
 *
 * @example @Trigger(TriggerCodeEnum.Webhook)
 */
export const Trigger = (trigger: TriggerCode) => {
  return applyDecorators(
    SetMetadata(TRIGGER_KEY, trigger),
    UseInterceptors(TriggerContextInterceptor),
  );
};
