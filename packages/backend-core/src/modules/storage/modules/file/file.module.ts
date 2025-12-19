import { Module, Provider } from '@nestjs/common';

import { FileService } from './application/file.service';
import { FileRepositoryPort } from './domain/file.repository.port';
import { FileStoragePort } from './domain/file.storage.port';
import { FileMapper } from './infra/file.mapper';
import { FileRepository } from './infra/file.repository';
import { S3Storage } from './infra/s3.storage';

const services: Provider[] = [FileService];
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
  providers: [...services, ...mappers, ...repositories, ...storages],
  exports: [...services, FileStoragePort, FileRepositoryPort],
})
export class FileModule {}
