import { DirectRepositoryPort, DomainResult } from '@workspace/backend-ddd';
import { FileId, FileReferenceId } from '@workspace/common';
import { FileReference } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { FileReferenceNotFoundError } from './file-reference.errors';

export interface CreateFileReferenceParam {
  fileId: FileId;
  targetType: string;
  targetId: ModelId;
}

export abstract class FileReferenceRepositoryPort extends DirectRepositoryPort<FileReference> {
  abstract getOneById(
    id: FileReferenceId,
  ): Promise<DomainResult<FileReference, FileReferenceNotFoundError>>;
  abstract create(param: CreateFileReferenceParam): Promise<DomainResult<FileReference, never>>;
  abstract createMany(params: CreateFileReferenceParam[]): Promise<DomainResult<void, never>>;
  abstract deleteById(id: FileReferenceId): Promise<DomainResult<void, FileReferenceNotFoundError>>;
  abstract deleteByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: string,
  ): Promise<DomainResult<void, FileReferenceNotFoundError>>;
  abstract deleteByTarget(
    targetType: string,
    targetId: ModelId,
  ): Promise<DomainResult<void, never>>;
  abstract checkExistenceByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: ModelId,
  ): Promise<boolean>;
  abstract checkExistenceByFileId(fileId: FileId): Promise<boolean>;
}
