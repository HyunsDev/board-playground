import { Entity } from '../domain/base.entity';

export interface Mapper<DomainEntity extends Entity<any>, DbRecord> {
  toPersistence(entity: DomainEntity): DbRecord;
  toDomain(record: any): DomainEntity;

  toPersistenceMany(entities: DomainEntity[]): DbRecord[];
  toDomainMany(records: any[]): DomainEntity[];
  toDomainOrNull(record: any): DomainEntity | null;
}

export abstract class BaseMapper<DomainEntity extends Entity<any>, DbRecord>
  implements Mapper<DomainEntity, DbRecord>
{
  abstract toDomain(record: any): DomainEntity;
  abstract toPersistence(entity: DomainEntity): DbRecord;

  toDomainMany(records: any[]): DomainEntity[] {
    return records.map((record) => this.toDomain(record));
  }

  toPersistenceMany(entities: DomainEntity[]): DbRecord[] {
    return entities.map((entity) => this.toPersistence(entity));
  }

  toDomainOrNull(record: any): DomainEntity | null {
    if (!record) return null;
    return this.toDomain(record);
  }
}
