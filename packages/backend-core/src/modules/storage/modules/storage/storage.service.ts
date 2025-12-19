import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { ReferencedFileCannotBeDeletedError } from './storage.errors';
import { FileService, InitializeUploadParam } from '../file/application/file.service';
import {
  CreateFileReferenceParam,
  FileReferenceRepositoryPort,
} from '../file-reference/domain/file-reference.repository.port';

@Injectable()
export class StorageService {
  constructor(
    private readonly fileReferenceRepo: FileReferenceRepositoryPort,
    private readonly fileService: FileService,
  ) {}

  async initializeUpload(data: InitializeUploadParam) {
    const result = await this.fileService.initializeUpload(data);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value);
  }

  async confirmUpload(fileId: string) {
    const result = await this.fileService.confirmUpload(fileId);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value);
  }

  async getDownloadUrl(fileId: string) {
    const result = await this.fileService.getDownloadUrl(fileId);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(result.value);
  }

  async bindFiles(fileIds: string[], targetType: string, targetId: string) {
    const refs = fileIds.map(
      (fileId) =>
        ({
          fileId,
          targetType,
          targetId,
        }) as const satisfies CreateFileReferenceParam,
    );
    const result = await this.fileReferenceRepo.createMany(refs);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }

  async unbindFile(fileId: string, targetType: string, targetId: string) {
    const deleteResult = await this.fileReferenceRepo.deleteByFileIdAndTarget(
      fileId,
      targetType,
      targetId,
    );
    if (deleteResult.isErr()) {
      return err(deleteResult.error);
    }
    return ok(undefined);
  }

  async unbindFilesByTarget(targetType: string, targetId: string) {
    const deleteResult = await this.fileReferenceRepo.deleteByTarget(targetType, targetId);
    if (deleteResult.isErr()) {
      return err(deleteResult.error);
    }
    return ok(undefined);
  }

  async deleteFile(fileId: string) {
    const refExists = await this.fileReferenceRepo.checkExistenceByFileId(fileId);
    if (refExists) {
      return err(new ReferencedFileCannotBeDeletedError());
    }

    const result = await this.fileService.deleteFile(fileId);
    if (result.isErr()) {
      return err(result.error);
    }
    return ok(undefined);
  }
}
