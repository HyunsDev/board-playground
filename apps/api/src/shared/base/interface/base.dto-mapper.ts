import { Paginated, PaginationMeta } from '@workspace/contract';

import { Entity } from '../domain/base.entity';

export abstract class BaseDtoMapper<E extends Entity<unknown>> {
  protected mapNullable<Dto>(entity: E | null, mapFn: (entity: E) => Dto): Dto | null {
    if (!entity) return null;
    return mapFn(entity);
  }

  protected mapMany<Dto>(entities: E[], mapFn: (entity: E) => Dto): Dto[] {
    return entities.map(mapFn);
  }

  protected mapPaginated<Dto>(
    entities: E[],
    meta: PaginationMeta,
    mapFn: (entity: E) => Dto,
  ): Paginated<Dto> {
    const items = this.mapMany(entities, mapFn);
    return {
      items,
      meta,
    };
  }
}
