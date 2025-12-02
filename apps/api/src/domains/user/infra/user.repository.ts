import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { Prisma, PrismaClient, User } from '@workspace/db';

import { UserMapper } from './user.mapper';
import { UserEntity } from '../domain/user.entity';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
  UserUsernameAlreadyExistsError,
} from '../domain/user.errors';
import { UserRepositoryPort } from '../domain/user.repository.port';

import { ContextService } from '@/infra/context/context.service';
import { DatabaseService } from '@/infra/database/database.service';
import { DomainEventDispatcher } from '@/infra/database/domain-event.dispatcher';
import { BaseRepository } from '@/shared/base/infra/base.repository';
import { DomainResult } from '@/shared/types/result.type';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, User> implements UserRepositoryPort {
  constructor(
    protected readonly prisma: DatabaseService,
    protected readonly context: ContextService,
    protected readonly mapper: UserMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, context, mapper, eventDispatcher, new Logger(UserRepository.name));
  }

  protected get delegate() {
    return (this.client as PrismaClient).user;
  }

  async getById(id: string): Promise<DomainResult<UserEntity, UserNotFoundError>> {
    const result = await this.findOneById(id);
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

  async count(): Promise<number> {
    return this.delegate.count();
  }

  async create(user: UserEntity) {
    const record = this.mapper.toPersistence(user);

    try {
      const result = await this.delegate.create({
        data: record,
      });

      this.publishEvents(user);
      return ok(this.mapper.toDomain(result));
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const targets = error.meta?.target as string[];
          if (targets.includes('email')) {
            return err(new UserEmailAlreadyExistsError());
          }
          if (targets.includes('username')) {
            return err(new UserUsernameAlreadyExistsError());
          }
        }
      }

      throw error;
    }
  }

  async update(user: UserEntity) {
    const record = this.mapper.toPersistence(user);

    try {
      const result = await this.delegate.update({
        where: { id: user.id },
        data: record,
      });

      this.publishEvents(user);
      return ok(this.mapper.toDomain(result));
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return err(new UserNotFoundError());
        }
        if (error.code === 'P2002') {
          const targets = error.meta?.target as string[];

          if (targets.includes('email')) {
            return err(new UserEmailAlreadyExistsError());
          }
          if (targets.includes('username')) {
            return err(new UserUsernameAlreadyExistsError());
          }
        }
      }

      throw error;
    }
  }
}
