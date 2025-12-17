import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import {
  DomainEventPublisherPort,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { FileReference, PrismaClient } from '@workspace/database';

import { FileReferenceMapper } from './file-reference.mapper';
import { FileReferenceEntity } from '../domain/file-reference.entity';
import { FileReferenceNotFoundError } from '../domain/file-reference.errors';
import { FileReferenceRepositoryPort } from '../domain/file-reference.repository.port';

import { BaseRepository } from '@/base';
import { ContextService } from '@/modules/context';
import { PrismaService } from '@/modules/database';

@Injectable()
export class FileReferenceRepository
  extends BaseRepository<FileReferenceEntity, FileReference>
  implements FileReferenceRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly context: ContextService,
    protected readonly mapper: FileReferenceMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txHost, mapper, eventDispatcher, new Logger(FileReferenceRepository.name));
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
    return ok(this.mapper.toDomain(record));
  }

  async create(fileReference: FileReferenceEntity) {
    return (await this.createEntity(fileReference)).match(
      (fileReference) => ok(fileReference),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async delete(fileReference: FileReferenceEntity) {
    return (await this.deleteEntity(fileReference)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new FileReferenceNotFoundError()),
        }),
    );
  }
}
