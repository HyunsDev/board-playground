import { Module } from '@nestjs/common';

import { CleanUpOrphanFilesJobHandler } from './workers/clean-up-orphan-files.handler';
import { StorageProcessor } from './workers/storage.processor';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [StorageProcessor, CleanUpOrphanFilesJobHandler],
})
export class StorageGcModule {}
