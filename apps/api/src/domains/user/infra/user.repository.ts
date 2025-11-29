import { Injectable, Logger } from '@nestjs/common';

import { PrismaClient, User } from '@workspace/db';

import { UserMapper } from './user.mapper';
import { UserEntity } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';

import { ContextService } from '@/infra/context/context.service';
import { DomainEventDispatcher } from '@/infra/prisma/domain-event.dispatcher';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { BaseRepository } from '@/shared/ddd/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, User> implements UserRepositoryPort {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly context: ContextService,
    protected readonly mapper: UserMapper,
    protected readonly eventDispatcher: DomainEventDispatcher,
  ) {
    super(prisma, context, mapper, eventDispatcher, new Logger(UserRepository.name));
  }

  protected get delegate() {
    return (this.client as PrismaClient).user;
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
}
