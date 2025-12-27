import { DomainResultAsync } from '@workspace/backend-ddd';

import { FileNotFoundError } from './file.errors';

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
  abstract generatePresignedPutUrl(options: PresignedUrlOptions): DomainResultAsync<string, never>;

  // 조회용 URL 발급 (Private 파일인 경우)
  abstract generatePresignedGetUrl(key: string): DomainResultAsync<string, never>;

  // 업로드 완료 확인용 (HeadObject)
  abstract getFileMetadata(key: string): DomainResultAsync<FileMetadataResult, FileNotFoundError>;

  abstract delete(key: string): DomainResultAsync<void, never>;

  abstract deleteMany(keys: string[]): DomainResultAsync<void, never>;
}
