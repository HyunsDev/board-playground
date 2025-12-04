export interface RepositoryPort<Entity> {
  findOneById(id: string): Promise<Entity | null>;

  // create(entity: Entity): Promise<DomainResult<Entity, EntityConflictError>>;
  // update(entity: Entity): Promise<DomainResult<Entity, EntityNotFoundError | EntityConflictError>>;
  // delete(entity: Entity): Promise<DomainResult<void, EntityNotFoundError>>;
}
