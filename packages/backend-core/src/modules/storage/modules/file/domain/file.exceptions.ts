import { BaseInternalServerException } from '@workspace/backend-ddd';

// S3 관련 알 수 없는 에러
export class UnexpectedS3Exception extends BaseInternalServerException<
  'UnexpectedS3Error',
  { originalError: unknown }
> {
  readonly code = 'UnexpectedS3Error' as const;

  constructor(error: unknown) {
    const message =
      error instanceof Error
        ? `S3 스토리지 연동 오류: ${error.message}`
        : `S3 스토리지 알 수 없는 오류: ${String(error)}`;

    super(message, { originalError: error }, error);
  }
}

// 메타데이터가 이상한 경우 (코드 레벨 버그 의심)
export class InvalidS3MetadataException extends BaseInternalServerException<'InvalidS3Metadata'> {
  readonly code = 'InvalidS3Metadata' as const;

  constructor(message: string = 'S3 알 수 없는 메타데이터 오류') {
    super(message);
  }
}
