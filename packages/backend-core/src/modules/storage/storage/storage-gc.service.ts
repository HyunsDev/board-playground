import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { FileService } from './modules/file/application/file.service';

@Injectable()
export class StorageGCService {
  constructor(private readonly fileService: FileService) {}

  async cleanUpOrphanFiles(batchSize: number, retentionThreshold: Date) {
    const cleanUpResult = await this.fileService.cleanUpOrphans(batchSize, retentionThreshold);
    if (cleanUpResult.isErr()) {
      return err(cleanUpResult.error);
    }
    return ok(cleanUpResult.value);
  }
}
