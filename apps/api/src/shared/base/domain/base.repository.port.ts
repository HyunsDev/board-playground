export interface RepositoryPort<Entity> {
  findOneById(id: string): Promise<Entity | null>;
}
