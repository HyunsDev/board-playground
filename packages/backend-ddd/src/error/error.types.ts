import { DomainError } from './abstract.domain-errors';
import { SystemException } from './abstract.system-exception';

export type DomainErrorScope = 'public' | 'private';

export type Failure = DomainError | SystemException;

export type PublicDomainError = DomainError & { scope: 'public' };

export type ExtractPublicDomainError<T> = Extract<T, { scope: 'public' }>;

export type EnsurePublic<T extends PublicDomainError> = T;
