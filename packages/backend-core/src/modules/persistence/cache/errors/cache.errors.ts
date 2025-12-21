import { BaseInternalServerError } from '@workspace/backend-ddd';

export class CacheInfrastructureError extends BaseInternalServerError<
  'CacheInfrastructureError',
  { key: string; originalError?: unknown }
> {
  readonly code = 'CacheInfrastructureError';
  readonly scope = 'private';
  constructor(key: string, originalError: unknown) {
    super('Cache infrastructure error', { key, originalError });
  }
}
