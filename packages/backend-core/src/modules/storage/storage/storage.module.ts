import { Module } from '@nestjs/common';

import { FileModule } from './modules/file/file.module';
import { FileReferenceModule } from './modules/file-reference/file-reference.module';
import { StorageGCService } from './storage-gc.service';
import { StorageFacade } from './storage.facade';
import { StorageService } from './storage.service';

@Module({
  imports: [FileModule, FileReferenceModule],
  providers: [StorageService, StorageGCService, StorageFacade],
  exports: [StorageFacade, StorageGCService],
})
export class StorageModule {}
