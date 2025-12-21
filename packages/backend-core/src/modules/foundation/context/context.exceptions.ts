import { BaseInternalServerException } from '@workspace/backend-ddd';

export class DrivenMessageMetadataNotFoundException extends BaseInternalServerException<'DrivenMessageMetadataNotFound'> {
  readonly code = 'DrivenMessageMetadataNotFound' as const;

  constructor(message = 'DrivenMessageMetadata를 찾을 수 없습니다', detail?: unknown) {
    super(message, detail);
  }
}

export class MessageTriggerNotFoundException extends BaseInternalServerException<'MessageTriggerNotFound'> {
  readonly code = 'MessageTriggerNotFound' as const;

  constructor(message = '등록된 Trigger가 없습니다.', detail?: unknown) {
    super(message, detail);
  }
}
