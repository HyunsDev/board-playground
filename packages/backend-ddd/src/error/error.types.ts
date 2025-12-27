import { DomainError } from './base.domain-errors';
import { SystemException } from './base.system-exception';

export type Failure = DomainError | SystemException;

export type PublicDomainError = DomainError & { scope: 'public' };

export type ExtractPublicDomainError<T> = Extract<T, { scope: 'public' }>;

export type EnsurePublic<T extends PublicDomainError> = T;
