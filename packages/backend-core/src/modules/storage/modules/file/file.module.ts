import { Module, Provider } from '@nestjs/common';

import { S3Module } from '../s3/s3.module';
import { FileFacade } from './application/facades/file.facade';
import { FileRepositoryPort } from './domain/file.repository.port';
import { FileMapper } from './infra/file.mapper';
import { FileRepository } from './infra/file.repository';

const facades: Provider[] = [FileFacade];
const mappers: Provider[] = [FileMapper];
const repositories: Provider[] = [
  {
    provide: FileRepositoryPort,
    useClass: FileRepository,
  },
];

@Module({
  imports: [S3Module],
  providers: [...facades, ...mappers, ...repositories],
  exports: [...facades],
})
export class FileModule {}
