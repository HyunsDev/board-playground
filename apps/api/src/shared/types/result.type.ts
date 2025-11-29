import { Result as NeverthrowResult } from 'neverthrow';

import { DomainError } from '../ddd/base.error';

export type Result<T, E extends DomainError = DomainError> = NeverthrowResult<T, E>;
