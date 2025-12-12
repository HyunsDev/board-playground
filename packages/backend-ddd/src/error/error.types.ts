import { Result as NeverthrowResult } from 'neverthrow';

import { DomainError } from './base.domain-errors';
import { SystemException } from './base.system-exception';

export type Failure = DomainError | SystemException;

export type PublicDomainError = DomainError & { scope: 'public' };

export type ExtractPublicDomainError<T> = Extract<T, { scope: 'public' }>;

export type EnsurePublic<T extends PublicDomainError> = T;

export type DomainResult<T, E extends DomainError = DomainError> = NeverthrowResult<T, E>;
