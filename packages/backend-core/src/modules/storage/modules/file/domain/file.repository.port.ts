import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';

import { FileEntity } from './file.entity';
import { FileAlreadyExistsError, FileNotFoundError } from './file.errors';

export abstract class FileRepositoryPort extends RepositoryPort<FileEntity> {
  abstract getOneById(id: string): Promise<DomainResult<FileEntity, FileNotFoundError>>;
  abstract findOneByKey(key: string): Promise<FileEntity | null>;
  abstract create(file: FileEntity): Promise<DomainResult<FileEntity, FileAlreadyExistsError>>;
  abstract update(
    file: FileEntity,
  ): Promise<DomainResult<FileEntity, FileNotFoundError | FileAlreadyExistsError>>;
  abstract delete(file: FileEntity): Promise<DomainResult<void, FileNotFoundError>>;

  abstract findOrphans(limit: number, retentionThreshold: Date): Promise<FileEntity[]>;
  abstract deleteManyDirectly(ids: string[]): Promise<void>;
}
