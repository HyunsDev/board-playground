import { DirectRepositoryPort, DomainResult } from '@workspace/backend-ddd';
import { FileReference } from '@workspace/database';

import { FileReferenceNotFoundError } from './file-reference.errors';

export interface CreateFileReferenceParam {
  fileId: string;
  targetType: string;
  targetId: string;
}

export abstract class FileReferenceRepositoryPort extends DirectRepositoryPort<FileReference> {
  abstract getOneById(id: string): Promise<DomainResult<FileReference, FileReferenceNotFoundError>>;
  abstract create(param: CreateFileReferenceParam): Promise<DomainResult<FileReference, never>>;
  abstract createMany(params: CreateFileReferenceParam[]): Promise<DomainResult<void, never>>;
  abstract deleteById(id: string): Promise<DomainResult<void, FileReferenceNotFoundError>>;
  abstract deleteByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: string,
  ): Promise<DomainResult<void, FileReferenceNotFoundError>>;
  abstract deleteByTarget(targetType: string, targetId: string): Promise<DomainResult<void, never>>;
  abstract checkExistenceByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean>;
  abstract checkExistenceByFileId(fileId: string): Promise<boolean>;
}
