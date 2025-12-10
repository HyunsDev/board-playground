import { DomainError } from './domain-errors';
import { SystemException } from './base.system-exception';

export type Failure = DomainError | SystemException;
