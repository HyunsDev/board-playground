import { DirectRepositoryPort, DomainResultAsync } from '@workspace/backend-ddd';
import { FileReference } from '@workspace/database';
import { FileId, FileReferenceId } from '@workspace/domain';
import { Id } from '@workspace/domain';

import { FileReferenceNotFoundError } from './file-reference.errors';

export interface CreateFileReferenceParam {
  fileId: FileId;
  targetType: string;
  targetId: Id;
}

export interface ExistsFileReferenceParam {
  fileId?: FileId;
  targetType?: string;
  targetId?: Id;
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
  abstract deleteByTarget(targetType: string, targetId: Id): DomainResultAsync<void, never>;
  abstract exists(params: ExistsFileReferenceParam): DomainResultAsync<boolean, never>;
}
