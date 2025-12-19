import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { DomainResult, matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { FileReference, PrismaClient } from '@workspace/database';

import { FileReferenceNotFoundError } from '../domain/file-reference.errors';
import {
  CreateFileReferenceParam,
  FileReferenceRepositoryPort,
} from '../domain/file-reference.repository.port';

import { BaseDirectRepository } from '@/base';
import { PrismaService } from '@/modules/database';

@Injectable()
export class FileReferenceRepository
  extends BaseDirectRepository<FileReference, PrismaClient['fileReference']>
  implements FileReferenceRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {
    super(prisma, txHost, new Logger(FileReferenceRepository.name));
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

    return (await this.safeCreate(item)).match(
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

    return (await this.safeCreateMany(items)).match(
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
    return (await this.safeDelete(id)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new FileReferenceNotFoundError()),
        }),
    );
  }

  async deleteByFileIdAndTarget(
    fileId: string,
    targetType: string,
    targetId: string,
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
    fileId: string,
    targetType: string,
    targetId: string,
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
