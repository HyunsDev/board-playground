import { Module, Provider } from '@nestjs/common';

import { FileReferenceRepositoryPort } from './domain/file-reference.repository.port';
import { FileReferenceRepository } from './infra/file-reference.repository';

const mappers: Provider[] = [];
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
