import { Result, ResultAsync } from 'neverthrow';

import { DomainError } from './base.domain-errors';

export type DomainResult<T, E extends DomainError = DomainError> = Result<T, E>;

export type DomainResultAsync<T, E extends DomainError = DomainError> = ResultAsync<T, E>;

export type PromiseDomainResult<T, E extends DomainError = DomainError> = Promise<
  DomainResult<T, E>
>;
