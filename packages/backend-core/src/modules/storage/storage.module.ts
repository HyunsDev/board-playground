import { Module } from '@nestjs/common';

import { FileModule } from './modules/file/file.module';
import { FileReferenceModule } from './modules/file-reference/file-reference.module';

@Module({
  imports: [FileModule, FileReferenceModule],
})
export class StorageModule {}
