import { DomainResultAsync } from '@/error';

export abstract class DirectRepositoryPort<TDbModel extends { id: string }> {
  abstract findOneById(id: string): DomainResultAsync<TDbModel | null, never>;
}
