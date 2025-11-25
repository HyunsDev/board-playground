import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DomainEventDispatcher } from './domain-event.dispatcher';
import { AggregateRoot } from '../ddd/base.aggregate-root';
import { Mapper } from '../ddd/base.mapper';
import { RepositoryPort, PaginatedQueryParams, PaginatedResult } from '../ddd/repository.port';
import { LoggerPort } from '../ports/logger.port';

import { ClsAccessor } from '@/libs/cls';
import { PrismaService } from '@/modules/prisma/prisma.service';

export abstract class BaseRepository<
  Aggregate extends AggregateRoot<any>,
  DbModel extends { id: string },
> implements RepositoryPort<Aggregate>
{
  protected abstract get delegate(): any;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventDispatcher: DomainEventDispatcher,
    protected readonly logger: LoggerPort,
  ) {}

  protected get client(): Prisma.TransactionClient | PrismaService {
    const tx = ClsAccessor.getTransactionClient();
    return tx ?? this.prisma;
  }

  async findOneById(id: string): Promise<Aggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
    });

    return record ? this.mapper.toDomain(record) : null;
  }

  async findAll(): Promise<Aggregate[]> {
    const records = await this.delegate.findMany();
    return this.mapper.toDomainMany(records as any[]);
  }

  async findAllPaginated(params: PaginatedQueryParams): Promise<PaginatedResult<Aggregate>> {
    const { page, take } = params;
    const skip = (page - 1) * take;

    const [records, count] = await Promise.all([
      this.delegate.findMany({
        skip,
        take,
      }),
      this.delegate.count(),
    ]);

    return {
      items: this.mapper.toDomainMany(records as any[]),
      total: count,
    };
  }

  async insert(entity: Aggregate | Aggregate[]): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];
    const records = entities.map((e) => this.mapper.toPersistence(e));

    try {
      // 대량 삽입 시 createMany가 더 효율적일 수 있으나,
      // DB 종류나 로직에 따라 루프가 필요할 수 있음. 여기선 루프 유지.
      for (const record of records) {
        await this.delegate.create({ data: record });
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        this.logger.debug(`Unique constraint failed: ${error.meta?.target}`);
        throw new ConflictException('Record already exists');
      }
      throw error;
    }

    // [핵심 변경] 저장 성공 후 이벤트 발행 (Pulling 방식)
    await this.publishEvents(entities);
  }

  async update(entity: Aggregate): Promise<Aggregate> {
    const record = this.mapper.toPersistence(entity);

    // AggregateRoot는 validate()를 생성자 등에서 수행하므로 여기선 생략 가능하나
    // 저장 직전 최종 검증을 원하면 entity.validate() 호출

    const updatedRecord = await this.delegate.update({
      where: { id: entity.id },
      data: record,
    });

    await this.publishEvents([entity]);

    return this.mapper.toDomain(updatedRecord);
  }

  async delete(entity: Aggregate): Promise<boolean> {
    await this.delegate.delete({
      where: { id: entity.id },
    });

    await this.publishEvents([entity]);
    return true;
  }

  private async publishEvents(entities: Aggregate[]): Promise<void> {
    for (const entity of entities) {
      const events = entity.pullEvents();
      this.eventDispatcher.addEvents(events);
    }
  }
}
