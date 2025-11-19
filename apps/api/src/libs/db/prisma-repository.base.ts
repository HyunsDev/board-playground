import { ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Paginated } from '@workspace/contract';
import { Prisma, PrismaClient } from '@workspace/db/dist';

import { AggregateRoot, Mapper, PaginatedQueryParams, RepositoryPort } from '../ddd';
import { LoggerPort } from '../ports/logger.port';
import { ObjectLiteral } from '../types';
import { pageTakeToSkipTake } from '../utils/page-take-to-skip-take';

import { ClsAccessor } from '@/libs/cls';
import { PrismaService } from '@/modules/prisma/prisma.service';

export abstract class PrismaRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel extends ObjectLiteral,
> implements RepositoryPort<Aggregate>
{
  protected abstract readonly modelName: keyof PrismaClient;

  protected constructor(
    // TODO: 이게 아마 커넥션 풀에서 가져오는건데, 이렇게 사용해도 되는지 의문
    protected readonly prisma: PrismaService,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: LoggerPort,
  ) {}

  /** 현재 요청의 트랜잭션 클라이언트 or 기본 prisma */
  protected get client(): PrismaClient | Prisma.TransactionClient {
    return ClsAccessor.getTransactionClient() ?? this.prisma;
  }

  async findOneById(id: string): Promise<Aggregate> {
    const result = await this.client[this.modelName].findUnique({
      where: { id },
    });

    return result ? this.mapper.toDomain(result) : null;
  }

  async findAll(): Promise<Aggregate[]> {
    const rows = await this.client[this.modelName].findMany({});
    return rows.map(this.mapper.toDomain);
  }

  async findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Aggregate>> {
    const { skip, take: take } = pageTakeToSkipTake(params);

    const rows = await this.client[this.modelName].findMany({
      skip,
      take,
    });

    const count = await this.client[this.modelName].count();

    return {
      items: rows.map(this.mapper.toDomain),
      meta: {
        total: count,
        totalPages: Math.ceil(count / take),
        page: params.page,
        take: take,
      },
    };
  }

  async delete(entity: Aggregate): Promise<boolean> {
    entity.validate();

    this.logger.debug(`[${ClsAccessor.getRequestId()}] deleting ${entity.id}`);

    await this.client[this.modelName].delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.logger, this.eventEmitter);
    return true;
  }

  /**
   * Insert (단일/다중)
   */
  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];
    const records = entities.map(this.mapper.toPersistence);

    try {
      if (this.client instanceof PrismaClient) {
        // 하나씩 create
        await this.client.$transaction(async (tx) => {
          for (const record of records) {
            await tx[this.modelName].create({ data: record });
          }
        });
      } else {
        for (const record of records) {
          await this.client[this.modelName].create({ data: record });
        }
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint
        this.logger.debug(
          `[${ClsAccessor.getRequestId()}] Unique violation: ${error.meta?.target}`,
        );
        throw new ConflictException('Record already exists');
      }
      throw error;
    }

    // domain event
    for (const ent of entities) {
      await ent.publishEvents(this.logger, this.eventEmitter);
    }
  }

  async update(entity: Aggregate): Promise<Aggregate> {
    const model = this.mapper.toPersistence(entity);
    const updatedModel = await this.client[this.modelName].update({
      where: { id: model.id },
      data: model,
    });
    await entity.publishEvents(this.logger, this.eventEmitter);
    return this.mapper.toDomain(updatedModel);
  }

  /**
   * 글로벌 트랜잭션 시작
   */
  async transaction<T>(handler: () => Promise<T>): Promise<T> {
    // Prisma 트랜잭션
    return await this.prisma.$transaction(async (tx) => {
      this.logger.debug(`[${ClsAccessor.getRequestId()}] transaction started`);
      ClsAccessor.setTransactionClient(tx);

      try {
        const result = await handler();
        this.logger.debug(`[${ClsAccessor.getRequestId()}] transaction committed`);
        return result;
      } catch (e) {
        this.logger.debug(`[${ClsAccessor.getRequestId()}] transaction aborted`);
        throw e;
      } finally {
        ClsAccessor.clearTransactionClient();
      }
    });
  }
}
