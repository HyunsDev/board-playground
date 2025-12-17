import { DomainError, DomainResult } from '@workspace/backend-ddd';

export interface PresignedUrlOptions {
  key: string;
  mimetype: string;
  expiresIn?: number;
  size: number;
}

export interface FileMetadataResult {
  size: number;
  mimetype: string;
  lastModified: Date;
}

export abstract class FileStoragePort {
  // 업로드용 URL 발급
  abstract generatePresignedPutUrl(
    options: PresignedUrlOptions,
  ): Promise<DomainResult<string, DomainError>>;

  // 조회용 URL 발급 (Private 파일인 경우)
  abstract generatePresignedGetUrl(key: string): Promise<DomainResult<string, DomainError>>;

  // 업로드 완료 확인용 (HeadObject)
  abstract getFileMetadata(key: string): Promise<DomainResult<FileMetadataResult, DomainError>>;

  abstract delete(key: string): Promise<DomainResult<void, DomainError>>;
}
