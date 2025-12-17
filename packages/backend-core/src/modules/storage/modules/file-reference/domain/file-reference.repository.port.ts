import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';

import { FileReferenceEntity } from './file-reference.entity';
import { FileReferenceNotFoundError } from './file-reference.errors';

export abstract class FileReferenceRepositoryPort extends RepositoryPort<FileReferenceEntity> {
  abstract getOneById(
    id: string,
  ): Promise<DomainResult<FileReferenceEntity, FileReferenceNotFoundError>>;
  abstract create(
    fileReference: FileReferenceEntity,
  ): Promise<DomainResult<FileReferenceEntity, never>>;
  abstract delete(
    fileReference: FileReferenceEntity,
  ): Promise<DomainResult<void, FileReferenceNotFoundError>>;
}
