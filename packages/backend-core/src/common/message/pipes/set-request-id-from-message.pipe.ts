import { Injectable, PipeTransform, mixin, Type } from '@nestjs/common';

import { AbstractMessage, InvalidMessageException } from '@workspace/backend-ddd';

import { CoreContext } from '@/modules';

/**
 * Mixin Factory Function
 * messageClass(설정)는 함수 인자로 받고,
 * CoreContext(의존성)는 NestJS DI 컨테이너에서 주입받습니다.
 */
export const SetRequestIdFromMessagePipe = (): Type<PipeTransform> => {
  @Injectable()
  class MixinSetRequestIdFromMessagePipe implements PipeTransform {
    constructor(private readonly coreContext: CoreContext) {}

    transform(value: AbstractMessage) {
      if (!value.metadata?.correlationId) {
        throw new InvalidMessageException('Missing correlationId in message metadata');
      }

      // 2. 주입받은 coreContext 사용
      this.coreContext.setRequestId(value.metadata.correlationId);

      return value;
    }
  }

  // NestJS의 mixin 헬퍼를 사용하여 클래스를 리턴
  return mixin(MixinSetRequestIdFromMessagePipe);
};
