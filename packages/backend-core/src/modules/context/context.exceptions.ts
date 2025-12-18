import { BaseInternalServerException } from '@workspace/backend-ddd';

export class DrivenMessageMetadataNotFoundException extends BaseInternalServerException<'DrivenMessageMetadataNotFound'> {
  readonly code = 'DrivenMessageMetadataNotFound' as const;

  constructor(message = 'DrivenMessageMetadata를 찾을 수 없습니다', detail?: unknown) {
    super(message, detail);
  }
}
