import { Injectable } from '@nestjs/common';

import { InitializeUploadParam } from './modules/file/application/file.service';
import { StorageService } from './storage.service';

@Injectable()
export class StorageFacade {
  constructor(private readonly storageService: StorageService) {}

  async initializeUpload(data: InitializeUploadParam) {
    return this.storageService.initializeUpload(data);
  }

  async confirmUpload(fileId: string) {
    return this.storageService.confirmUpload(fileId);
  }

  async getDownloadUrl(fileId: string) {
    return this.storageService.getDownloadUrl(fileId);
  }

  async bindFiles(fileIds: string[], targetType: string, targetId: string) {
    return this.storageService.bindFiles(fileIds, targetType, targetId);
  }

  async unbindFile(fileId: string, targetType: string, targetId: string) {
    return this.storageService.unbindFile(fileId, targetType, targetId);
  }

  async unbindFilesByTarget(targetType: string, targetId: string) {
    return this.storageService.unbindFilesByTarget(targetType, targetId);
  }

  async deleteFile(fileId: string) {
    return this.storageService.deleteFile(fileId);
  }
}
