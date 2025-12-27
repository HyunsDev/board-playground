import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import {
  DomainResultAsync,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { FileId } from '@workspace/common';
import { FileReference, PrismaClient } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { FileReferenceNotFoundError } from '../domain/file-reference.errors';
import {
  CreateFileReferenceParam,
  ExistsFileReferenceParam,
  FileReferenceRepositoryPort,
} from '../domain/file-reference.repository.port';

import { BaseDirectRepository } from '@/base';
import { TransactionContext } from '@/modules/foundation';
import { PrismaService } from '@/modules/persistence/database';

@Injectable()
export class FileReferenceRepository
  extends BaseDirectRepository<FileReference, PrismaClient['fileReference']>
  implements FileReferenceRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
  ) {
    super(prisma, txContext);
  }

  protected get delegate(): PrismaClient['fileReference'] {
    return this.client.fileReference;
  }

  getOneById(id: string) {
    return this.getUniqueRecord({
      where: { id },
    }).mapErr((error) => {
      return matchError(error, {
        EntityNotFound: () => new FileReferenceNotFoundError(),
      });
    });
  }

  create(param: CreateFileReferenceParam) {
    const now = new Date();
    return this.createRecord({
      data: {
        id: v7(),
        createdAt: now,
        updatedAt: now,
        ...param,
      },
    }).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  createMany(params: CreateFileReferenceParam[]) {
    const now = new Date();
    const items: FileReference[] = params.map((param) => ({
      id: v7(),
      createdAt: now,
      updatedAt: now,
      fileId: param.fileId,
      targetType: param.targetType,
      targetId: param.targetId,
    }));
    return this.createManyRecords({
      data: items,
    }).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  deleteByFileIdAndTarget(fileId: FileId, targetType: string, targetId: ModelId) {
    return this.deleteManyRecords({
      where: {
        fileId,
        targetType,
        targetId,
      },
    }).andThen((deletedCount) => {
      if (deletedCount === 0) {
        return err(new FileReferenceNotFoundError());
      }
      return ok(undefined);
    });
  }

  deleteByTarget(targetType: string, targetId: string) {
    return this.deleteManyRecords({
      where: {
        targetType,
        targetId,
      },
    }).map(() => undefined);
  }

  exists(params: ExistsFileReferenceParam): DomainResultAsync<boolean, never> {
    return this.existsRecord({
      where: {
        fileId: params.fileId,
        targetType: params.targetType,
        targetId: params.targetId,
      },
    });
  }
}
