import { Injectable } from '@nestjs/common';

import {
  DeletedAggregate,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { FileId } from '@workspace/common';
import { File, PrismaClient } from '@workspace/database';

import { FileMapper } from './file.mapper';
import { FileEntity } from '../domain/file.entity';
import { FileAlreadyExistsError, FileNotFoundError } from '../domain/file.errors';
import { FileRepositoryPort } from '../domain/file.repository.port';

import { DomainEventPublisherPort } from '@/base';
import { BaseRepository } from '@/base/blocks/base.repository';
import { TransactionContext } from '@/modules/foundation/context';
import { PrismaService } from '@/modules/persistence/database';

@Injectable()
export class FileRepository
  extends BaseRepository<FileEntity, File, PrismaClient['file']>
  implements FileRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: FileMapper,
    protected readonly eventPublisher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventPublisher);
  }

  protected get delegate(): PrismaClient['file'] {
    return this.client.file;
  }

  findOneByKey(key: string) {
    return this.findUniqueEntity({
      where: { key },
    });
  }

  getOneById(id: FileId) {
    return this.getUniqueEntity({
      where: { id },
    }).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new FileNotFoundError(),
      }),
    );
  }

  create(file: FileEntity) {
    return this.createEntity(file).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          if (e.details?.conflicts.some((conflict) => conflict.field === 'key')) {
            return new FileAlreadyExistsError('File with the same key already exists.');
          }
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  update(file: FileEntity) {
    return this.updateEntity(file).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new FileNotFoundError(),
        EntityConflict: (e) => {
          if (e.details?.conflicts.some((conflict) => conflict.field === 'key')) {
            return new FileAlreadyExistsError('File with the same key already exists.');
          }
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  delete(file: DeletedAggregate<FileEntity>) {
    return this.deleteEntity(file).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new FileNotFoundError(),
      }),
    );
  }

  findOrphans(limit: number, retentionThreshold: Date) {
    return this.findManyEntities({
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
  }

  deleteManyDirectly(ids: FileId[]) {
    return this.deleteManyEntitiesDirectly({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
