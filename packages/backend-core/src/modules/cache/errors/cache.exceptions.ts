import { BaseInternalServerException } from '@workspace/backend-ddd';

export class CacheInfrastructureErrorException extends BaseInternalServerException<
  'CacheInfrastructureError',
  { key: string; originalError?: unknown }
> {
  readonly code = 'CacheInfrastructureError';
  constructor(message?: string, details?: { key: string; originalError: unknown }) {
    super(message ?? 'Cache infrastructure error', details);
  }
}
