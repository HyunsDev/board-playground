export interface AbstractRepositoryPort<Entity> {
  findOneById(id: string): Promise<Entity | null>;
}
