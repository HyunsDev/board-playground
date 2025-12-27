import { DomainResultAsync } from '@/error';

export abstract class StorePort {
  abstract exists(id: string): DomainResultAsync<boolean, never>;
}
