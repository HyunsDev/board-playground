import { Result as NeverthrowResult } from 'neverthrow';

import { DomainError } from '../base/error/base.domain-errors';

/**
 * DomainError 만 허용하는 Result 타입
 */
export type DomainResult<T, E extends DomainError = DomainError> = NeverthrowResult<T, E>;
