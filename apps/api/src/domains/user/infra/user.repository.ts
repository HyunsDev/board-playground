import { Injectable, Logger } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { err, ok } from 'neverthrow';

import { PrismaClient, User } from '@workspace/db';

import { UserMapper } from './user.mapper';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from '../domain/user.domain-errors';
import { UserEntity } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';

import { ContextService } from '@/infra/context/context.service';
import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { PaginatedResult, UnexpectedDomainErrorException } from '@/shared/base';
import { BaseRepository } from '@/shared/base/infra/base.repository';
import { DomainResult } from '@/shared/types/result.type';
import { matchError } from '@/shared/utils/match-error.utils';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, User> implements UserRepositoryPort {
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly context: ContextService,
    protected readonly mapper: UserMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, txHost, mapper, eventDispatcher, new Logger(UserRepository.name));
  }

  protected get delegate(): PrismaClient['user'] {
    return this.client.user;
  }

  async getOneById(id: string): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new UserNotFoundError());
    }
    return ok(result);
  }

  async getOneByEmail(email: string): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneByEmail(email);
    if (!result) {
      return err(new UserNotFoundError());
    }
    return ok(result);
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.delegate.findUnique({
      where: { email },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findOneByUsername(username: string): Promise<UserEntity | null> {
    const record = await this.delegate.findUnique({
      where: { username },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async usernameExists(username: string): Promise<boolean> {
    const count = await this.delegate.count({
      where: { username },
    });
    return count > 0;
  }

  async searchUsers(params: {
    nickname?: string;
    page: number;
    take: number;
  }): Promise<PaginatedResult<UserEntity>> {
    const whereClause = params.nickname
      ? {
          nickname: {
            contains: params.nickname,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const users = await this.delegate.findMany({
      where: whereClause,
      skip: (params.page - 1) * params.take,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.delegate.count({ where: whereClause });

    return {
      items: this.mapper.toDomainMany(users),
      meta: {
        total,
        page: params.page,
        take: params.take,
        totalPages: Math.ceil(total / params.take),
      },
    };
  }

  async count(): Promise<number> {
    return this.delegate.count();
  }

  async create(user: UserEntity) {
    return (await this.createEntity(user)).match(
      (user) => ok(user),
      (error) =>
        matchError(error, {
          EntityConflict: ({ details }) => {
            if (details?.conflicts.some((conflict) => conflict.field === 'email')) {
              return err(new UserEmailAlreadyExistsError());
            }
            if (details?.conflicts.some((conflict) => conflict.field === 'username')) {
              return err(new UserUsernameAlreadyExistsError());
            }
            throw new UnexpectedDomainErrorException(error);
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
          EntityConflict: ({ details }) => {
            if (details?.conflicts.some((conflict) => conflict.field === 'email')) {
              return err(new UserEmailAlreadyExistsError());
            }
            if (details?.conflicts.some((conflict) => conflict.field === 'username')) {
              return err(new UserUsernameAlreadyExistsError());
            }
            throw new UnexpectedDomainErrorException(error);
          },
        }),
    );
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
