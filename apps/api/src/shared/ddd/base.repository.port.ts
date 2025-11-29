export type OrderBy = { field: string; param: 'asc' | 'desc' };

export interface PaginatedQueryParams {
  page: number;
  take: number;
  orderBy?: OrderBy;
}
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface RepositoryPort<Entity> {
  insert(entity: Entity | Entity[]): Promise<void>;
  findOneById(id: string): Promise<Entity | null>;
  findAll(): Promise<Entity[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<PaginatedResult<Entity>>;
  update(entity: Entity): Promise<Entity>;
  delete(entity: Entity): Promise<boolean>;
}
