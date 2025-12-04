import { ApiErrorResponseBody } from '@workspace/contract';

import { DomainError } from '../error/base.domain-errors';

export interface TsRestErrorResponse {
  status: number;
  body: ApiErrorResponseBody;
}

export type PublicDomainError = DomainError & { scope: 'public' };
export type ExtractPublicDomainError<T> = Extract<T, { scope: 'public' }>;
export type EnsurePublic<T extends PublicDomainError> = T;
