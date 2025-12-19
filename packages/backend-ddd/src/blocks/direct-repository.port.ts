export abstract class DirectRepositoryPort<TDbModel extends { id: string }> {
  abstract findOneById(id: string): Promise<TDbModel | null>;
}
