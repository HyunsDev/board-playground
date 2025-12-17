import { Module, Provider } from '@nestjs/common';

import { FileReferenceRepositoryPort } from './domain/file-reference.repository.port';
import { FileReferenceMapper } from './infra/file-reference.mapper';
import { FileReferenceRepository } from './infra/file-reference.repository';

const mappers: Provider[] = [FileReferenceMapper];
const repositories: Provider[] = [
  {
    provide: FileReferenceRepositoryPort,
    useClass: FileReferenceRepository,
  },
];

@Module({
  providers: [...mappers, ...repositories],
  exports: [FileReferenceRepositoryPort],
})
export class FileReferenceModule {}
