import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import {
  DeletedAggregate,
  DomainResult,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import {
  createPaginatedResult,
  getPaginationSkip,
  PaginatedResult,
  PaginationQuery,
  UserId,
} from '@workspace/common';
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

  async findOne(params: UserFindOneParams): Promise<UserEntity | null> {
    return await this.findOneEntity({
      where: {
        id: params.id,
        email: params.email,
        username: params.username,
      },
    });
  }

  async getOne(params: UserFindOneParams): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    return (
      await this.getOneEntity({
        where: {
          id: params.id,
          email: params.email,
          username: params.username,
        },
      })
    ).mapErr(() => new UserNotFoundError());
  }

  async getOneById(id: UserId): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new UserNotFoundError());
    }
    return ok(result);
  }

  async exists(params: UserExistsParams): Promise<boolean> {
    return await this.existsEntity({
      where: {
        id: params.id,
        email: params.email,
        username: params.username,
      },
    });
  }

  async searchUsers(
    params: PaginationQuery<{ nickname?: string }>,
  ): Promise<PaginatedResult<UserEntity>> {
    const whereClause = params.nickname
      ? {
          nickname: {
            contains: params.nickname,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const options = getPaginationSkip(params);

    const users = await this.delegate.findMany({
      where: whereClause,
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.delegate.count({ where: whereClause });

    return createPaginatedResult({
      items: this.mapper.toDomainMany(users),
      totalItems: total,
      options: { page: params.page, limit: params.limit },
    });
  }

  async create(user: UserEntity) {
    return (await this.createEntity(user)).match(
      (user) => ok(user),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            if (e.details?.conflicts.some((conflict) => conflict.field === 'email')) {
              return err(new UserEmailAlreadyExistsError());
            }
            if (e.details?.conflicts.some((conflict) => conflict.field === 'username')) {
              return err(new UserUsernameAlreadyExistsError());
            }
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async update(user: UserEntity) {
    return (await this.updateEntity(user)).match(
      (user) => ok(user),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new UserNotFoundError()),
          EntityConflict: (e) => {
            if (e.details?.conflicts.some((conflict) => conflict.field === 'email')) {
              return err(new UserEmailAlreadyExistsError());
            }
            if (e.details?.conflicts.some((conflict) => conflict.field === 'username')) {
              return err(new UserUsernameAlreadyExistsError());
            }
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async updateLastActiveAt(userId: string) {
    return (
      await this.updateOneDirectly({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
        select: {
          id: true,
        },
      })
    ).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new UserNotFoundError()),
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async delete(user: DeletedAggregate<UserEntity>) {
    return (await this.deleteEntity(user)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new UserNotFoundError()),
        }),
    );
  }
}
