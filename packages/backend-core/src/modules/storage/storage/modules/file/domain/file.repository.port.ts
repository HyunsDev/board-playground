import { DomainResultAsync, RepositoryPort } from '@workspace/backend-ddd';
import { FileId } from '@workspace/domain';

import { FileEntity } from './file.entity';
import { FileAlreadyExistsError, FileNotFoundError } from './file.errors';

export abstract class FileRepositoryPort extends RepositoryPort<FileEntity> {
  abstract getOneById(id: FileId): DomainResultAsync<FileEntity, FileNotFoundError>;
  abstract findOneByKey(key: string): DomainResultAsync<FileEntity | null, never>;
  abstract create(file: FileEntity): DomainResultAsync<FileEntity, FileAlreadyExistsError>;
  abstract update(
    file: FileEntity,
  ): DomainResultAsync<FileEntity, FileNotFoundError | FileAlreadyExistsError>;
  abstract delete(file: FileEntity): DomainResultAsync<void, FileNotFoundError>;
  abstract findOrphans(
    limit: number,
    retentionThreshold: Date,
  ): DomainResultAsync<FileEntity[], never>;
  abstract deleteManyDirectly(ids: FileId[]): DomainResultAsync<void, never>;
}
