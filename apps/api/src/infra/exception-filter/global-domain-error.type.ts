import {
  AccessDeniedError,
  EnsurePublic,
  ExpiredTokenError,
  InternalServerError,
  InvalidAccessTokenError,
  MissingTokenError,
  UnexpectedDomainError,
} from '@/shared/base';

export type GlobalDomainError = EnsurePublic<
  | AccessDeniedError
  | InternalServerError
  | UnexpectedDomainError
  | InvalidAccessTokenError
  | ExpiredTokenError
  | MissingTokenError
>;
