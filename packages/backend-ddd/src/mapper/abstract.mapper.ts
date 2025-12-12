import { createPaginatedResult, PaginatedResult } from '@workspace/common';

import { AbstractEntity } from '@/blocks';

export abstract class AbstractMapper<
  Entity extends AbstractEntity<unknown>,
  DbRecord extends Record<string, unknown>,
> {
  abstract toDomain(record: DbRecord): Entity;
  abstract toPersistence(entity: Entity): DbRecord;

  toDomainMany(records: DbRecord[]): Entity[] {
    return records.map((record) => this.toDomain(record));
  }

  toDomainPaginated(
    records: DbRecord[],
    totalRecords: number,
    options: { page: number; limit: number },
  ): PaginatedResult<Entity> {
    return createPaginatedResult({
      items: this.toDomainMany(records),
      totalItems: totalRecords,
      options,
    });
  }

  toPersistenceMany(entities: Entity[]): DbRecord[] {
    return entities.map((entity) => this.toPersistence(entity));
  }

  toDomainOrNull(record: DbRecord | null): Entity | null {
    if (!record) return null;
    return this.toDomain(record);
  }
}
