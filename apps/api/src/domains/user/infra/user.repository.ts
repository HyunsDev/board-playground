import { Injectable } from '@nestjs/common';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import {
  DeletedAggregate,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { PaginationQuery, UserId } from '@workspace/common';
import { PrismaClient, User } from '@workspace/database';

import { UserMapper } from './user.mapper';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from '../domain/user.domain-errors';
import { UserEntity } from '../domain/user.entity';
import {
  UserExistsParams,
  UserFindOneParams,
  UserRepositoryPort,
} from '../domain/user.repository.port';

@Injectable()
export class UserRepository
  extends BaseRepository<UserEntity, User, PrismaClient['user']>
  implements UserRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: UserMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher);
  }

  protected get delegate(): PrismaClient['user'] {
    return this.client.user;
  }

  findOne(params: UserFindOneParams) {
    return this.findUniqueEntity({
      where: {
        id: params.id,
        email: params.email,
        username: params.username,
      },
    });
  }

  getOne(params: UserFindOneParams) {
    return this.getUniqueEntity({
      where: {
        id: params.id,
        email: params.email,
        username: params.username,
      },
    }).mapErr(() => new UserNotFoundError());
  }

  getOneById(id: UserId) {
    return this.getUniqueEntity({ where: { id } }).mapErr(() => new UserNotFoundError());
  }

  exists(params: UserExistsParams) {
    return this.existsEntity({
      where: {
        id: params.id,
        email: params.email,
        username: params.username,
      },
    });
  }

  searchUsers(params: PaginationQuery<{ nickname?: string }>) {
    const whereClause = params.nickname
      ? {
          nickname: {
            contains: params.nickname,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return this.findManyPaginatedEntities(params, {
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(user: UserEntity) {
    return this.createEntity(user).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          if (e.details?.conflicts.some((conflict) => conflict.field === 'email')) {
            return new UserEmailAlreadyExistsError();
          }
          if (e.details?.conflicts.some((conflict) => conflict.field === 'username')) {
            return new UserUsernameAlreadyExistsError();
          }
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  update(user: UserEntity) {
    return this.updateEntity(user).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new UserNotFoundError(),
        EntityConflict: (e) => {
          if (e.details?.conflicts.some((conflict) => conflict.field === 'email')) {
            return new UserEmailAlreadyExistsError();
          }
          if (e.details?.conflicts.some((conflict) => conflict.field === 'username')) {
            return new UserUsernameAlreadyExistsError();
          }
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  updateLastActiveAt(userId: string) {
    return this.updateOneDirectly({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
      select: {
        id: true,
      },
    })
      .map(() => undefined)
      .mapErr((error) =>
        matchError(error, {
          EntityNotFound: () => new UserNotFoundError(),
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
      );
  }

  delete(user: DeletedAggregate<UserEntity>) {
    return this.deleteEntity(user).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new UserNotFoundError(),
      }),
    );
  }
}
