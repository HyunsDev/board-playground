import { createPaginatedResult, PaginatedResult } from '@workspace/common';

import { AbstractEntity } from '@/blocks';

export abstract class AbstractMapper<Entity extends AbstractEntity<any>, DbRecord> {
  abstract toDomain(record: any): Entity;
  abstract toPersistence(entity: Entity): DbRecord;

  toDomainMany(records: any[]): Entity[] {
    return records.map((record) => this.toDomain(record));
  }

  toDomainPaginated(
    records: any[],
    totalRecords: number,
    options: { page: number; limit: number },
  ): PaginatedResult<Entity> {
    return createPaginatedResult(this.toDomainMany(records), totalRecords, options);
  }

  toPersistenceMany(entities: Entity[]): DbRecord[] {
    return entities.map((entity) => this.toPersistence(entity));
  }

  toDomainOrNull(record: any): Entity | null {
    if (!record) return null;
    return this.toDomain(record);
  }
}
