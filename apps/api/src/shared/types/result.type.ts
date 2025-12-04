import { Result as NeverthrowResult } from 'neverthrow';

import { DomainError } from '../base/error/base.domain-errors';

export type DomainResult<T, E extends DomainError = DomainError> = NeverthrowResult<T, E>;
