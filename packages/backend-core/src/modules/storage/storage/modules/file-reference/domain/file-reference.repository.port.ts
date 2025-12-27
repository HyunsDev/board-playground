import { DirectRepositoryPort, DomainResultAsync } from '@workspace/backend-ddd';
import { FileId, FileReferenceId } from '@workspace/common';
import { FileReference } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { FileReferenceNotFoundError } from './file-reference.errors';

export interface CreateFileReferenceParam {
  fileId: FileId;
  targetType: string;
  targetId: ModelId;
}

export interface ExistsFileReferenceParam {
  fileId?: FileId;
  targetType?: string;
  targetId?: ModelId;
}

export abstract class FileReferenceRepositoryPort extends DirectRepositoryPort<FileReference> {
  abstract getOneById(
    id: FileReferenceId,
  ): DomainResultAsync<FileReference, FileReferenceNotFoundError>;
  abstract create(param: CreateFileReferenceParam): DomainResultAsync<FileReference, never>;
  abstract createMany(params: CreateFileReferenceParam[]): DomainResultAsync<void, never>;
  abstract deleteByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: string,
  ): DomainResultAsync<void, FileReferenceNotFoundError>;
  abstract deleteByTarget(targetType: string, targetId: ModelId): DomainResultAsync<void, never>;
  abstract exists(params: ExistsFileReferenceParam): DomainResultAsync<boolean, never>;
}
