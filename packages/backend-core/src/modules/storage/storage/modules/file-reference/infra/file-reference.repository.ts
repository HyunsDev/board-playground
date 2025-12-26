import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { DomainResult, matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { FileId } from '@workspace/common';
import { FileReference, PrismaClient } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { FileReferenceNotFoundError } from '../domain/file-reference.errors';
import {
  CreateFileReferenceParam,
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

  async getOneById(id: string) {
    const record = await this.delegate.findUnique({
      where: { id },
    });
    if (!record) {
      return err(new FileReferenceNotFoundError());
    }
    return ok(record);
  }

  async create(param: CreateFileReferenceParam) {
    const now = new Date();
    const item: FileReference = {
      id: v7(),
      createdAt: now,
      updatedAt: now,
      ...param,
    };

    return (await this.createRecord(item)).match(
      (result) => ok(result),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async createMany(params: CreateFileReferenceParam[]) {
    const now = new Date();
    const items: FileReference[] = params.map((param) => ({
      id: v7(),
      createdAt: now,
      updatedAt: now,
      fileId: param.fileId,
      targetType: param.targetType,
      targetId: param.targetId,
    }));

    return (await this.createManyRecords(items)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async deleteById(id: string): Promise<DomainResult<void, FileReferenceNotFoundError>> {
    return (await this.deleteRecord(id)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new FileReferenceNotFoundError()),
        }),
    );
  }

  async deleteByFileIdAndTarget(
    fileId: FileId,
    targetType: string,
    targetId: ModelId,
  ): Promise<DomainResult<void, FileReferenceNotFoundError>> {
    const deleteCount = await this.delegate.deleteMany({
      where: {
        fileId,
        targetType,
        targetId,
      },
    });

    if (deleteCount.count === 0) {
      return err(new FileReferenceNotFoundError());
    }

    return ok(undefined);
  }

  async deleteByTarget(targetType: string, targetId: string): Promise<DomainResult<void, never>> {
    await this.delegate.deleteMany({
      where: {
        targetType,
        targetId,
      },
    });
    return ok(undefined);
  }

  async checkExistenceByFileIdAndTarget(
    fileId: FileId,
    targetType: string,
    targetId: ModelId,
  ): Promise<boolean> {
    const count = await this.delegate.count({
      where: {
        fileId,
        targetType,
        targetId,
      },
    });
    return count > 0;
  }

  async checkExistenceByFileId(fileId: string): Promise<boolean> {
    const count = await this.delegate.count({
      where: {
        fileId,
      },
    });
    return count > 0;
  }
}
