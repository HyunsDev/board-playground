import { Result as NeverthrowResult } from 'neverthrow';

import { DomainError } from '../base/error/base.domain-error';

export type DomainResult<T, E extends DomainError = DomainError> = NeverthrowResult<T, E>;
