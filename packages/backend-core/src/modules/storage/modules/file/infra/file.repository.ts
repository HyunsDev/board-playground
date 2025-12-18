import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import {
  DomainEventPublisherPort,
  DomainResult,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { File, PrismaClient } from '@workspace/database';

import { FileMapper } from './file.mapper';
import { FileEntity } from '../domain/file.entity';
import { FileAlreadyExistsError, FileNotFoundError } from '../domain/file.errors';
import { FileRepositoryPort } from '../domain/file.repository.port';

import { BaseRepository } from '@/base';
import { ContextService } from '@/modules/context';
import { PrismaService } from '@/modules/database';

@Injectable()
export class FileRepository extends BaseRepository<FileEntity, File> implements FileRepositoryPort {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly context: ContextService,
    protected readonly mapper: FileMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txHost, mapper, eventDispatcher, new Logger(FileRepository.name));
  }

  protected get delegate(): PrismaClient['file'] {
    return this.client.file;
  }

  async findOneByKey(key: string): Promise<FileEntity | null> {
    const record = await this.delegate.findFirst({
      where: { key },
    });
    if (!record) {
      return null;
    }
    return this.mapper.toDomain(record);
  }

  async getOneById(id: string): Promise<DomainResult<FileEntity, FileNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new FileNotFoundError());
    }
    return ok(result);
  }

  async create(file: FileEntity): Promise<DomainResult<FileEntity, FileAlreadyExistsError>> {
    return (await this.createEntity(file)).match(
      (file) => ok(file),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            if (e.details?.conflicts.some((conflict) => conflict.field === 'key')) {
              return err(new FileAlreadyExistsError('File with the same key already exists.'));
            }
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async update(
    file: FileEntity,
  ): Promise<DomainResult<FileEntity, FileNotFoundError | FileAlreadyExistsError>> {
    return (await this.updateEntity(file)).match(
      (file) => ok(file),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new FileNotFoundError()),
          EntityConflict: (e) => {
            if (e.details?.conflicts.some((conflict) => conflict.field === 'key')) {
              return err(new FileAlreadyExistsError('File with the same key already exists.'));
            }
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async delete(file: FileEntity): Promise<DomainResult<void, FileNotFoundError>> {
    return (await this.deleteEntity(file)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new FileNotFoundError()),
        }),
    );
  }

  async findOrphans(limit: number, retentionThreshold: Date): Promise<FileEntity[]> {
    const records = await this.delegate.findMany({
      where: {
        references: {
          none: {},
        },
        createdAt: {
          lt: retentionThreshold,
        },
      },
      take: limit,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  async deleteManyDirectly(ids: string[]): Promise<void> {
    await this.delegate.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
