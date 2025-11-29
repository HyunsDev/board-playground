import { Result } from 'neverthrow';

import { DomainError } from '../ddd/base.error';

export type DomainResult<T, E extends DomainError = DomainError> = Result<T, E>;
