import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { FileEntity } from '../domain/file.entity';
import { FileAccessType } from '../domain/file.enums';
import { FileRepositoryPort } from '../domain/file.repository.port';
import { FileStoragePort } from '../domain/file.storage.port';

export interface InitializeUploadParam {
  originalName: string;
  accessType: FileAccessType;
  uploaderId: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepo: FileRepositoryPort,
    private readonly s3Port: FileStoragePort,
  ) {}

  async initializeUpload(data: InitializeUploadParam) {
    // 1) Entity 생성
    const fileResult = FileEntity.create(data);
    if (fileResult.isErr()) {
      return err(fileResult.error);
    }
    let file = fileResult.value;

    // 2) DB 저장 (PENDING)
    const createResult = await this.fileRepo.create(file);
    if (createResult.isErr()) {
      return err(createResult.error);
    }
    file = createResult.value;

    // 3) Presigned URL 발급
    const presignedUrlResult = await this.s3Port.generatePresignedPutUrl({
      key: file.key,
      mimetype: file.mimeType,
      size: file.size,
    });
    if (presignedUrlResult.isErr()) {
      return err(presignedUrlResult.error);
    }

    return ok({
      file,
      uploadUrl: presignedUrlResult.value,
    });
  }

  async confirmUpload(fileId: string) {
    const fileResult = await this.fileRepo.getOneById(fileId);
    if (fileResult.isErr()) {
      return err(fileResult.error);
    }
    let file = fileResult.value;

    // S3 실제 확인
    const metadataResult = await this.s3Port.getFileMetadata(file.key);
    if (metadataResult.isErr()) {
      return err(metadataResult.error);
    }
    const metadata = metadataResult.value;

    // 도메인 로직 수행 (상태 변경)
    const confirmUploadResult = file.confirmUpload(metadata);
    if (confirmUploadResult.isErr()) {
      return err(confirmUploadResult.error);
    }

    // DB 업데이트
    const updateResult = await this.fileRepo.update(file);
    if (updateResult.isErr()) {
      return err(updateResult.error);
    }
    file = updateResult.value;

    return ok(file);
  }

  async getDownloadUrl(fileId: string) {
    const fileResult = await this.fileRepo.getOneById(fileId);
    if (fileResult.isErr()) {
      return err(fileResult.error);
    }
    const file = fileResult.value;

    const presignedUrlResult = await this.s3Port.generatePresignedGetUrl(file.key);
    if (presignedUrlResult.isErr()) {
      return err(presignedUrlResult.error);
    }

    return ok(presignedUrlResult.value);
  }

  /**
   * 주의! FileService는 FileReference 관리를 하지 않습니다.
   * StorageService 를 사용하세요.
   */
  async deleteFile(fileId: string) {
    const fileResult = await this.fileRepo.getOneById(fileId);
    if (fileResult.isErr()) {
      return err(fileResult.error);
    }
    const file = fileResult.value;

    // DB 레코드 삭제
    const dbDeleteResult = await this.fileRepo.delete(file);
    if (dbDeleteResult.isErr()) {
      return err(dbDeleteResult.error);
    }

    // S3 파일 삭제
    // 파일 삭제 실패시 레코드도 DB 트랜젝션에 의해 롤백
    const s3DeleteResult = await this.s3Port.delete(file.key);
    if (s3DeleteResult.isErr()) {
      return err(s3DeleteResult.error);
    }

    return ok(undefined);
  }

  async cleanUpOrphans(limit: number, retentionThreshold: Date) {
    const orphans = await this.fileRepo.findOrphans(limit, retentionThreshold);
    if (orphans.length === 0) {
      return ok(0);
    }

    const keysToDelete: string[] = [];
    const idsToDelete: string[] = [];

    for (const orphan of orphans) {
      keysToDelete.push(orphan.key);
      idsToDelete.push(orphan.id);
    }

    await this.fileRepo.deleteManyDirectly(idsToDelete);

    const s3DeleteResult = await this.s3Port.deleteMany(keysToDelete);
    if (s3DeleteResult.isErr()) {
      return err(s3DeleteResult.error);
    }

    return ok(orphans.length);
  }
}
