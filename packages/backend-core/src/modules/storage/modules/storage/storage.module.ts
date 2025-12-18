import { Module } from '@nestjs/common';

import { StorageFacade } from './storage.facade';
import { StorageService } from './storage.service';
import { FileModule } from '../file/file.module';
import { FileReferenceModule } from '../file-reference/file-reference.module';

@Module({
  imports: [FileModule, FileReferenceModule],
  providers: [StorageService, StorageFacade],
  exports: [StorageFacade],
})
export class StorageModule {}
