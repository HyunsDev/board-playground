import { Paginated, PaginationMeta } from '@workspace/contract';

import { Entity } from '../domain/base.entity';

export interface DtoMapper<DomainEntity extends Entity<any>, Dto> {
  toDto(entity: DomainEntity): Dto;
}

export abstract class BaseDtoMapper<DomainEntity extends Entity<any>, Dto>
  implements DtoMapper<DomainEntity, Dto>
{
  abstract toDto(entity: DomainEntity): Dto;

  toDtoMany(entities: DomainEntity[]): Dto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  toDtoOrNull(entity: DomainEntity | null): Dto | null {
    if (!entity) return null;
    return this.toDto(entity);
  }

  toPaginatedDto(entities: DomainEntity[], meta: PaginationMeta): Paginated<Dto> {
    return {
      items: this.toDtoMany(entities),
      meta,
    };
  }
}
