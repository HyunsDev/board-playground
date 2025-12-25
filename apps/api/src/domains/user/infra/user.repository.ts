import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import { DomainResult, matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import {
  createPaginatedResult,
  getPaginationSkip,
  PaginatedResult,
  PaginationQuery,
  UserEmail,
  UserId,
  Username,
} from '@workspace/common';
import { Prisma, PrismaClient, User } from '@workspace/database';

import { UserMapper } from './user.mapper';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from '../domain/user.domain-errors';
import { UserEntity } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, User> implements UserRepositoryPort {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: UserMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher, new Logger(UserRepository.name));
  }

  protected get delegate(): PrismaClient['user'] {
    return this.client.user;
  }

  async getOneById(id: UserId): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new UserNotFoundError());
    }
    return ok(result);
  }

  async getOneByEmail(email: UserEmail): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneByEmail(email);
    if (!result) {
      return err(new UserNotFoundError());
    }
    return ok(result);
  }

  async findOneByEmail(email: UserEmail): Promise<UserEntity | null> {
    const record = await this.delegate.findUnique({
      where: { email },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findOneByUsername(username: Username): Promise<UserEntity | null> {
    const record = await this.delegate.findUnique({
      where: { username },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async usernameExists(username: Username): Promise<boolean> {
    const count = await this.delegate.count({
      where: { username },
    });
    return count > 0;
  }

  async userEmailExists(email: UserEmail): Promise<boolean> {
    const count = await this.delegate.count({
      where: { email },
    });
    return count > 0;
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

  async count(): Promise<number> {
    return this.delegate.count();
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
    try {
      void (await this.delegate.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
        select: { id: true },
      }));
      return ok(undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(new UserNotFoundError());
        }
      }
      throw error;
    }
  }

  async delete(user: UserEntity) {
    return (await this.deleteEntity(user)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new UserNotFoundError()),
        }),
    );
  }
}
