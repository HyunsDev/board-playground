import { Module, Provider } from '@nestjs/common';

import { FileFacade } from './application/facades/file.facade';
import { FileRepositoryPort } from './domain/file.repository.port';
import { FileStoragePort } from './domain/file.storage.port';
import { FileMapper } from './infra/file.mapper';
import { FileRepository } from './infra/file.repository';
import { S3Storage } from './infra/s3.storage';

const facades: Provider[] = [FileFacade];
const mappers: Provider[] = [FileMapper];
const repositories: Provider[] = [
  {
    provide: FileRepositoryPort,
    useClass: FileRepository,
  },
];
const storages: Provider[] = [
  {
    provide: FileStoragePort,
    useClass: S3Storage,
  },
];

@Module({
  imports: [],
  providers: [...facades, ...mappers, ...repositories, ...storages],
  exports: [...facades, ...repositories, ...storages],
})
export class FileModule {}
