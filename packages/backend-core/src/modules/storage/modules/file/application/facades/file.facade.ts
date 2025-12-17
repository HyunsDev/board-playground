import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { FileEntity } from '../../domain/file.entity';
import { FileAccessType } from '../../domain/file.enums';
import { FileRepositoryPort } from '../../domain/file.repository.port';
import { FileStoragePort } from '../../domain/file.storage.port';

@Injectable()
export class FileFacade {
  constructor(
    private readonly fileRepo: FileRepositoryPort,
    private readonly s3Port: FileStoragePort,
  ) {}

  async initializeUpload(data: {
    originalName: string;
    accessType: FileAccessType;
    uploaderId: string;
    mimeType: string;
    size: number;
  }) {
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
}
