import {
  BrandId,
  createPaginatedResult,
  PaginatedResult,
  PaginationMetadata,
} from '@workspace/common';

import { AbstractEntity } from '@/blocks';

export abstract class AbstractDtoMapper<E extends AbstractEntity<unknown, BrandId>> {
  protected mapNullable<Dto>(entity: E | null, mapFn: (entity: E) => Dto): Dto | null {
    if (!entity) return null;
    return mapFn(entity);
  }

  protected mapMany<Dto>(entities: E[], mapFn: (entity: E) => Dto): Dto[] {
    return entities.map(mapFn);
  }

  protected mapPaginated<Dto>(
    entities: E[],
    meta: PaginationMetadata,
    mapFn: (entity: E) => Dto,
  ): PaginatedResult<Dto> {
    const items = this.mapMany(entities, mapFn);
    return createPaginatedResult({
      items,
      totalItems: meta.totalItems,
      options: { page: meta.page, limit: meta.limit },
    });
  }
}
