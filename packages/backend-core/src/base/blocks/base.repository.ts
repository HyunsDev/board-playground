// packages/backend-core/src/base/blocks/base.repository.ts
import { ResultAsync } from 'neverthrow';

import {
  AbstractMapper,
  RepositoryPort,
  DomainResultAsync,
  EntityConflictError,
  EntityNotFoundError,
  DeletedAggregate,
} from '@workspace/backend-ddd';
import { PrismaClient } from '@workspace/database';
import { ModelId } from '@workspace/domain';

import { DomainEventPublisherPort } from '../messages';
import { BaseAggregateRoot } from './base.aggregate-root';
import { BaseEntityRepository } from './base.entity-repository';
import { AbstractCrudDelegate } from './base.types';

import { TransactionContext } from '@/modules';

export abstract class BaseRepository<
  TAggregate extends BaseAggregateRoot<unknown, ModelId>,
  TDbModel extends { id: string },
  TDelegate extends AbstractCrudDelegate<TDbModel>,
>
  extends BaseEntityRepository<TAggregate, TDbModel, TDelegate>
  implements RepositoryPort<TAggregate>
{
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: AbstractMapper<TAggregate, TDbModel>,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper);
  }

  protected override createEntity(
    entity: TAggregate,
  ): DomainResultAsync<TAggregate, EntityConflictError> {
    return super.createEntity(entity).andTee((savedEntity) => this.publishEvents(savedEntity));
  }

  protected override updateEntity(
    entity: TAggregate,
  ): DomainResultAsync<TAggregate, EntityNotFoundError | EntityConflictError> {
    return super.updateEntity(entity).andTee((savedEntity) => this.publishEvents(savedEntity));
  }

  protected override deleteEntity(
    entity: DeletedAggregate<TAggregate>,
  ): DomainResultAsync<void, EntityNotFoundError> {
    return super.deleteEntity(entity).andTee(() => this.publishEvents(entity));
  }

  protected publishEvents(entity: TAggregate): DomainResultAsync<void, never> {
    const events = entity.pullEvents();
    return ResultAsync.fromSafePromise(this.eventDispatcher.publishMany(events));
  }
}
