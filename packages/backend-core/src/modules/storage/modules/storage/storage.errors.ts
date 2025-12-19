import { BaseBadRequestError } from '@workspace/backend-ddd';

export class ReferencedFileCannotBeDeletedError extends BaseBadRequestError<'ReferencedFileCannotBeDeleted'> {
  readonly code = 'ReferencedFileCannotBeDeleted' as const;
  readonly scope = 'public' as const;

  constructor(message = '레퍼런스된 파일은 삭제할 수 없습니다', detail?: unknown) {
    super(message, detail);
  }
}
