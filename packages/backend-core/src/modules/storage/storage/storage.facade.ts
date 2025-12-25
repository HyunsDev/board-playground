import { Injectable } from '@nestjs/common';

import { FileId } from '@workspace/common';
import { ModelId } from '@workspace/domain';

import { InitializeUploadParam } from './modules/file/application/file.service';
import { StorageService } from './storage.service';

@Injectable()
export class StorageFacade {
  constructor(private readonly storageService: StorageService) {}

  async initializeUpload(data: InitializeUploadParam) {
    return this.storageService.initializeUpload(data);
  }

  async confirmUpload(fileId: FileId) {
    return this.storageService.confirmUpload(fileId);
  }

  async getDownloadUrl(fileId: FileId) {
    return this.storageService.getDownloadUrl(fileId);
  }

  async bindFiles(fileIds: FileId[], targetType: string, targetId: ModelId) {
    return this.storageService.bindFiles(fileIds, targetType, targetId);
  }

  async unbindFile(fileId: FileId, targetType: string, targetId: ModelId) {
    return this.storageService.unbindFile(fileId, targetType, targetId);
  }

  async unbindFilesByTarget(targetType: string, targetId: ModelId) {
    return this.storageService.unbindFilesByTarget(targetType, targetId);
  }

  async deleteFile(fileId: FileId) {
    return this.storageService.deleteFile(fileId);
  }
}
